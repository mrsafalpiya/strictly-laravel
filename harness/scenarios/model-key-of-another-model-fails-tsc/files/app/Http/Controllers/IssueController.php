<?php

namespace App\Http\Controllers;

use App\Data\BulkUpdateIssuesData;
use App\Data\IssueData;
use App\Data\MemberData;
use App\Models\Issue;
use App\Models\User;
use App\Pages\Issues\IndexPage;
use App\Pages\Issues\ShowPage;
use Illuminate\Http\RedirectResponse;

final class IssueController extends Controller
{
    public function index(): IndexPage
    {
        return new IndexPage(
            issues: array_values(Issue::query()->orderBy('number')->get()->map(IssueData::fromModel(...))->all()),
            members: array_values(User::query()->orderBy('name')->get()->map(MemberData::fromModel(...))->all()),
        );
    }

    public function show(Issue $issue): ShowPage
    {
        return new ShowPage(issue: IssueData::fromModel($issue));
    }

    public function bulkUpdate(BulkUpdateIssuesData $data): RedirectResponse
    {
        Issue::query()->whereKey($data->ids)->update(['assignee_id' => $data->assigneeId]);

        return back();
    }
}
