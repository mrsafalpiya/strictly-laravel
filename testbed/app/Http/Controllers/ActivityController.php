<?php

namespace App\Http\Controllers;

use App\Data\Activity\ActivityData;
use App\Data\Activity\ActivityFiltersData;
use App\Models\Workspace;
use App\Pages\Activity\IndexPage;
use Illuminate\Database\Eloquent\Builder;
use Inertia\ScrollMetadata;
use Inertia\ScrollProp;
use Spatie\LaravelData\CursorPaginatedDataCollection;

final class ActivityController extends Controller
{
    public const int PER_PAGE = 30;

    public function index(ActivityFiltersData $filters, Workspace $workspace): IndexPage
    {

        $paginator = $workspace->activities()
            ->when($filters->types !== [], fn (Builder $query) => $query->whereIn('type', $filters->types))
            ->with(['user', 'issue.project'])
            ->latest('id')
            ->cursorPaginate(self::PER_PAGE)
            ->withQueryString();

        // Not Inertia::scroll(): the Inertia facade is reserved for App\Support\Inertia (arch test).
        // The metadata is read from the paginator, as the laravel-data collection wraps it.
        return new IndexPage(
            activity: new ScrollProp(
                ActivityData::collect($paginator, CursorPaginatedDataCollection::class),
                metadata: ScrollMetadata::fromPaginator($paginator),
            ),
            filters: $filters,
        );
    }
}
