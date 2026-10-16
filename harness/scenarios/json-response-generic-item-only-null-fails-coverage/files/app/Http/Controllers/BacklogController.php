<?php

namespace App\Http\Controllers;

use App\Data\IssueData;
use App\Data\ListingData;

final class BacklogController extends Controller
{
    /**
     * @return ListingData<IssueData>
     */
    public function show(): ListingData
    {
        return new ListingData(column: 'Backlog', items: [
            new IssueData(number: 1, title: 'Launch', assignee: null),
            new IssueData(number: 2, title: 'Polish', assignee: null),
        ]);
    }
}
