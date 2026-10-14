<?php

namespace Tests\Support;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Support\Facades\Event;
use ReflectionClass;

/**
 * Records which request input keys an action reads (`input('remember')`, `boolean('force')`, `only('email')`,
 * `$request->password`, …), so a declared vendor payload (config/types.php) is checked against what the vendor
 * actually reads, not only against what it validates (see InertiaContracts).
 *
 * Reads are tracked by TracksInputReads: the test request is a TrackedRequest (TestCase::createTestRequest),
 * and every FormRequest the container resolves (e.g. Fortify's LoginRequest) is swapped for a subclass using
 * the trait. Reading the whole input (`all()`, `input()`) records nothing: it names no field.
 *
 * Not recorded: framework protocol keys (`_token`, `_method`, `_error_bag`), and reads by framework code that
 * owns its own parameters — the paginator (`page`, `cursor`: it builds those links itself) and laravel-data
 * (its `include`/`exclude` response partials).
 */
final class InputReads
{
    private const array FRAMEWORK_READERS = ['Illuminate\\Pagination\\', 'Spatie\\LaravelData\\'];

    /** @var list<string> Keys read since the current request matched its route. */
    private static array $keys = [];

    public static function listen(Application $app): void
    {
        Event::listen(RouteMatched::class, function (): void {
            self::$keys = [];
        });

        $app->beforeResolving(function (mixed $abstract) use ($app): void {
            if (is_string($abstract) && is_subclass_of($abstract, FormRequest::class) && ! $app->bound($abstract)) {
                $tracked = self::trackedSubclass($abstract);

                if ($tracked !== null) {
                    $app->bind($abstract, $tracked);
                }
            }
        });
    }

    public static function record(string ...$keys): void
    {
        foreach (debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 12) as $frame) {
            if (isset($frame['class']) && array_any(self::FRAMEWORK_READERS, fn (string $namespace): bool => str_starts_with($frame['class'], $namespace))) {
                return;
            }
        }

        array_push(self::$keys, ...array_filter($keys, fn (string $key): bool => ! str_starts_with($key, '_')));
    }

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_values(array_unique(self::$keys));
    }

    /**
     * A subclass of the FormRequest that tracks reads (final classes can't be tracked: their reads go unseen,
     * so coverage reports the fields they read as never read).
     *
     * @param  class-string<FormRequest>  $class
     * @return class-string<FormRequest>|null
     */
    private static function trackedSubclass(string $class): ?string
    {
        if ((new ReflectionClass($class))->isFinal()) {
            return null;
        }

        $name = 'Tracked'.substr(sha1($class), 0, 16);
        $tracked = __NAMESPACE__.'\\Tracked\\'.$name;

        if (! class_exists($tracked, false)) {
            // A class extending an arbitrary FormRequest can only be declared at runtime.
            eval(sprintf('namespace %s\Tracked; final class %s extends \%s { use \%s; }', __NAMESPACE__, $name, $class, TracksInputReads::class));
        }

        /** @var class-string<FormRequest> $tracked */
        return $tracked;
    }
}
