<?php

namespace App\Http\Controllers;

use App\Data\StoreMeetingData;

final class MeetingController extends Controller
{
    // Answers with the meeting as it was read, so the tests see each date round-trip.
    public function store(StoreMeetingData $meeting): StoreMeetingData
    {
        return $meeting;
    }
}
