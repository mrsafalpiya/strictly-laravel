<?php

namespace App\Http\Controllers;

use App\Data\MeetingFiltersData;
use App\Data\StoreMeetingData;

final class MeetingController extends Controller
{
    // Each action answers with what it read, so the tests see the instant each date was read as.
    public function index(MeetingFiltersData $filters): MeetingFiltersData
    {
        return $filters;
    }

    public function store(StoreMeetingData $meeting): StoreMeetingData
    {
        return $meeting;
    }
}
