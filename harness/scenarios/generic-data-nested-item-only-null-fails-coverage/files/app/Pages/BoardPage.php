<?php

namespace App\Pages;

use App\Data\BoardData;
use App\Data\IssueData;
use StrictlyLaravel\Inertia\Page;

final class BoardPage extends Page
{
    /**
     * @param  BoardData<IssueData>  $board
     */
    public function __construct(
        public BoardData $board,
    ) {}
}
