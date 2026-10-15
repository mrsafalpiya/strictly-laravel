<?php

namespace App\Http\Controllers;

use App\Data\IssueData;
use App\Models\Issue;
use App\Pages\Issues\ShowPage;

final class IssueController extends Controller
{
    public function show(Issue $issue): ShowPage
    {
        return new ShowPage(issue: IssueData::fromModel($issue));
    }
}
