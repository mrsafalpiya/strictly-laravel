<?php

namespace App\Data;

use Carbon\CarbonImmutable;
use StrictlyLaravel\Data\QueryData;

/**
 * The meeting list's filters: `?from=2026-10-14T09:30:00.000Z`.
 */
final class MeetingFiltersData extends QueryData
{
    public function __construct(
        public ?CarbonImmutable $from = null,
    ) {}
}
