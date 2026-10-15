<?php

namespace Tests\Browser\Support;

use Illuminate\Foundation\Http\Events\RequestHandled;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Pest\Browser\Api\PendingAwaitablePage;
use PHPUnit\Framework\Assert;
use Throwable;

/**
 * What the smoke test watches while it drives the Testbed App in a headless browser: every problem the browser reports
 * (a console error or warning, an uncaught error, an unhandled rejection, an asset that failed to load, a fetch or XHR
 * that failed or answered 4xx/5xx), every request the app answered with a 4xx or 5xx, and the Inertia page components
 * the app served.
 *
 * Pest's browser plugin serves the app in the test's own process, so both sides are watched through Laravel's
 * RequestHandled event: it records the response, and puts a probe script first in every HTML page's head, which records
 * what the browser reports. The plugin's own console capture sees only console.log and uncaught errors.
 */
final class Smoke
{
    /**
     * Runs in every page before the app's scripts. A WebSocket that can't connect (Echo, with no Reverb server running)
     * is reported by the browser itself, not through console.*, so it isn't a problem here.
     */
    private const string PROBE = <<<'JS'
        (() => {
            const smoke = (window.__smoke = { problems: [], inflight: 0, lastRequest: performance.now() });
            const text = (value) => {
                if (value instanceof Error) return value.stack ?? `${value.name}: ${value.message}`;
                if (typeof value === 'object' && value !== null) {
                    try { return JSON.stringify(value); } catch { return String(value); }
                }
                return String(value);
            };
            const started = () => { smoke.inflight++; smoke.lastRequest = performance.now(); };
            const ended = () => { smoke.inflight--; smoke.lastRequest = performance.now(); };

            for (const level of ['error', 'warn']) {
                const original = console[level];
                console[level] = function (...args) {
                    smoke.problems.push(`console.${level}: ${args.map(text).join(' ')}`);
                    return original.apply(this, args);
                };
            }

            // In the capture phase: a failed <script>, <link> or <img> load doesn't bubble.
            addEventListener('error', (event) => {
                const source = event.target?.src ?? event.target?.href;
                smoke.problems.push(event.target !== window && source
                    ? `failed to load ${source}`
                    : `uncaught ${text(event.error ?? event.message)} (${event.filename}:${event.lineno})`);
            }, true);
            addEventListener('unhandledrejection', (event) => smoke.problems.push(`unhandled rejection: ${text(event.reason)}`));

            const fetch = window.fetch;
            window.fetch = async function (input, init) {
                const request = `${init?.method ?? 'GET'} ${input instanceof Request ? input.url : String(input)}`;
                started();
                try {
                    const response = await fetch.call(this, input, init);
                    if (response.status >= 400) smoke.problems.push(`HTTP ${response.status} from fetch ${request}`);
                    return response;
                } catch (error) {
                    if (error?.name !== 'AbortError') smoke.problems.push(`fetch ${request} failed: ${text(error)}`);
                    throw error;
                } finally {
                    ended();
                }
            };

            const open = XMLHttpRequest.prototype.open;
            const send = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.open = function (method, url, ...rest) {
                this.__smokeRequest = `${method} ${url}`;
                return open.call(this, method, url, ...rest);
            };
            XMLHttpRequest.prototype.send = function (...args) {
                let aborted = false;
                started();
                this.addEventListener('abort', () => (aborted = true));
                this.addEventListener('loadend', () => {
                    ended();
                    if (aborted) return;
                    if (this.status === 0) smoke.problems.push(`XHR ${this.__smokeRequest} failed`);
                    else if (this.status >= 400) smoke.problems.push(`HTTP ${this.status} from XHR ${this.__smokeRequest}`);
                });
                return send.apply(this, args);
            };
        })();
        JS;

    /** How long the page must make no request to count as settled, as Playwright's `networkidle`. */
    private const int QUIET_MS = 500;

    /** @var list<string> */
    private array $serverProblems = [];

    /** @var array<string, true> */
    private array $components = [];

    private function __construct()
    {
        Event::listen(RequestHandled::class, function (RequestHandled $event): void {
            // The app serves every request in this one process, so the next request starts as it would in a PHP process
            // of its own, and each browser context is its own visitor: the session store keeps no attributes of this
            // request's session (it reloads the next request's own, saved by its id), and no user this request
            // resolved or scoped instance (CurrentWorkspace) it made is left over.
            app('session.store')->flush();
            Auth::forgetGuards();
            app()->forgetScopedInstances();

            $response = $event->response;
            $content = (string) $response->getContent();

            if ($response->getStatusCode() >= 400) {
                // Read from the object: a Symfony response (a file download) has no `exception`, unlike Laravel's.
                $exception = get_object_vars($response)['exception'] ?? null;

                $this->serverProblems[] = "HTTP {$response->getStatusCode()} from {$event->request->method()} {$event->request->getRequestUri()}"
                    .($exception instanceof Throwable ? ' ('.$exception::class.': '.$exception->getMessage().')' : '');
            }

            if (str_starts_with((string) $response->headers->get('Content-Type'), 'text/html')) {
                $response->setContent(Str::replaceFirst('<head>', '<head><script>'.self::PROBE.'</script>', $content));
            }

            $component = self::componentOf($content);

            if ($component !== null) {
                $this->components[$component] = true;
            }
        });
    }

    /** Starts watching the app's responses. */
    public static function watch(): self
    {
        return new self;
    }

    /** Opens a browser at the given app path. Each call is a fresh browser context: no cookies, so a guest. */
    public function open(string $path): PendingAwaitablePage
    {
        return visit($path);
    }

    /** Loads the given app path in the page, a full page load. */
    public function go(PendingAwaitablePage $page, string $path): PendingAwaitablePage
    {
        $page->navigate($path);

        return $page;
    }

    /** Opens a browser at the login page and logs in through its form. */
    public function logIn(string $email, string $password): PendingAwaitablePage
    {
        $page = $this->open('/login');
        $page->fill('email', $email)->fill('password', $password)->press('@login-button');
        $page->assertScript("window.history.state?.page?.component !== 'auth/login'", true);

        return $page;
    }

    /** Waits until the browser shows the given Inertia page component. */
    public function assertComponent(PendingAwaitablePage $page, string $component): void
    {
        $page->assertScript('window.history.state?.page?.component', $component);
    }

    /**
     * Waits until the page has made no request for a moment, then fails with every problem the browser and the server
     * reported since the last check, under the given step's name.
     */
    public function assertClean(PendingAwaitablePage $page, string $step): void
    {
        Assert::assertSame([], $this->problems($page, $step), "{$step} wasn't clean.");
    }

    /**
     * Every problem since the last check, once the page has made no request for a moment. When there is one, a
     * screenshot named after the step is saved in tests/Browser/Screenshots.
     *
     * @return list<string>
     */
    public function problems(PendingAwaitablePage $page, string $step): array
    {
        $page->assertScript('window.__smoke.inflight === 0 && performance.now() - window.__smoke.lastRequest > '.self::QUIET_MS, true);

        $browser = $page->script('window.__smoke.problems.splice(0)');
        $problems = [
            ...array_map(fn (mixed $problem): string => 'browser: '.(is_string($problem) ? $problem : (string) json_encode($problem)), is_array($browser) ? array_values($browser) : []),
            ...array_map(fn (string $problem): string => "server: {$problem}", $this->serverProblems),
        ];
        $this->serverProblems = [];

        if ($problems !== []) {
            $page->screenshot(filename: Str::slug($step));
        }

        return $problems;
    }

    /**
     * Every Inertia page component the app has served, sorted.
     *
     * @return list<string>
     */
    public function components(): array
    {
        $components = array_keys($this->components);
        sort($components);

        return $components;
    }

    /** The page component of an Inertia response: the page object itself, or the HTML document embedding it. */
    private static function componentOf(string $content): ?string
    {
        if (preg_match('/<script data-page="[^"]*" type="application\/json">(.*?)<\/script>/s', $content, $match) === 1) {
            $content = $match[1];
        }

        $page = json_decode($content, true);

        return is_array($page) && is_string($page['component'] ?? null) && array_key_exists('props', $page)
            ? $page['component']
            : null;
    }
}
