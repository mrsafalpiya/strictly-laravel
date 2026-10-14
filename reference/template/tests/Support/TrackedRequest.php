<?php

namespace Tests\Support;

use Illuminate\Http\Request;

/** The request of every feature test (TestCase::createTestRequest): records the input keys the app reads. */
final class TrackedRequest extends Request
{
    use TracksInputReads;
}
