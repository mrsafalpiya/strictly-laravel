<?php

namespace App\Http\Middleware;

use App\Enums\Locale;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Translates the request into the locale the browser prefers (Accept-Language) among Tracklane's, English when it
 * prefers none of them. Before HandleInertiaRequests, which shares the locale so the client's t() translates into it.
 */
final class SetLocale
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // The first locale (English) when the browser prefers none of them.
        $preferred = $request->getPreferredLanguage(array_map(fn (Locale $locale): string => $locale->value, Locale::cases()));

        App::setLocale($preferred ?? Locale::English->value);

        return $next($request);
    }
}
