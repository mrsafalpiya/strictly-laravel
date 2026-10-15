<?php

namespace App\Http\Controllers;

use App\Data\ProjectData;
use App\Data\ProjectStatsData;
use App\Models\Project;
use App\Pages\Projects\IndexPage;
use Inertia\ScrollMetadata;
use Inertia\ScrollProp;
use Spatie\LaravelData\CursorPaginatedDataCollection;
use Spatie\LaravelData\Lazy;

final class ProjectController extends Controller
{
    public const int PER_PAGE = 20;

    public function index(): IndexPage
    {
        $paginator = Project::query()->orderBy('id')->cursorPaginate(self::PER_PAGE);

        return new IndexPage(
            projects: new ScrollProp(
                ProjectData::collect($paginator, CursorPaginatedDataCollection::class),
                metadata: ScrollMetadata::fromPaginator($paginator),
            ),
            stats: Lazy::inertiaDeferred(fn (): ProjectStatsData => new ProjectStatsData(
                total: Project::query()->count(),
                withoutDescription: Project::query()->whereNull('description')->count(),
            )),
        );
    }
}
