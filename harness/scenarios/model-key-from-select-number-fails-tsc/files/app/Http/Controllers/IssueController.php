<?php

namespace App\Http\Controllers;

use App\Data\BulkUpdateIssuesData;
use App\Data\IssueData;
use App\Data\MemberData;
use App\Models\Issue;
use App\Models\User;
use App\Pages\Issues\IndexPage;
use Illuminate\Http\RedirectResponse;

final class IssueController extends Controller
{
    public function index(): IndexPage
    {
        return new IndexPage(
            issues: Issue::query()->orderBy('number')->get()->map(IssueData::fromModel(...))->all(),
            members: User::query()->orderBy('name')->get()->map(MemberData::fromModel(...))->all(),
        );
    }

    public function bulkUpdate(BulkUpdateIssuesData $data): RedirectResponse
    {
        Issue::query()->whereKey($data->ids)->update(['assignee_id' => $data->assigneeId]);

        return back();
    }
}
