<?php

namespace App\Http\Middleware;

use App\Data\FeaturesData;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Answers 404 for the routes of a feature config/tracklane.php turns off: `->middleware(EnsureFeatureEnabled::class.':cycles')`.
 */
final class EnsureFeatureEnabled
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        abort_unless(FeaturesData::enabled($feature), 404);

        return $next($request);
    }
}
