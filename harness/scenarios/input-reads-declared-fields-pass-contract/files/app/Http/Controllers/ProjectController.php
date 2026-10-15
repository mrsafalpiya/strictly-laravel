<?php

namespace App\Http\Controllers;

use App\Data\ProjectPreviewData;
use App\Data\StoreProjectData;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class ProjectController extends Controller
{
    /**
     * Reads its input's own fields every way a request allows; `$request->workspace` is the route parameter.
     */
    public function store(StoreProjectData $data, Request $request): RedirectResponse
    {
        $context = [
            'public' => $request->boolean('public'),
            'named' => $request->filled('name') && $request->has('name'),
            'tagged' => $request->hasAny(['tags', 'tags.0']) && $request->input('tags.*') !== [],
            'notify' => $request->only(['settings.notifyOnAssign']) !== [],
            'magic' => $request->name === $data->name,
            'workspace' => $request->workspace,
        ];

        return to_route('dashboard', in_array(false, $context, true) ? ['draft' => 1] : []);
    }

    /**
     * The paginators read `page` and `cursor`, and laravel-data reads its response partials (`include`, `exclude`,
     * `only`, `except`) as it responds: framework plumbing, not the input's fields.
     */
    public function preview(StoreProjectData $data): ProjectPreviewData
    {
        return new ProjectPreviewData(
            name: $data->name,
            members: User::query()->paginate(10)->total(),
            moreRecent: User::query()->orderBy('id')->cursorPaginate(10)->hasMorePages(),
        );
    }
}
