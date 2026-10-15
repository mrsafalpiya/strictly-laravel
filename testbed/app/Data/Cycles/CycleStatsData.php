<?php

namespace App\Data\Cycles;

use Spatie\LaravelData\Data;

/** Progress of a cycle. Deferred on the cycle page: it needs every issue's completion date. */
final class CycleStatsData extends Data
{
    public function __construct(
        /** Issues in the cycle, excluding canceled ones. */
        public int $scope,
        /** Issues done. */
        public int $completed,
        /** 0–100, rounded down. */
        public int $percent,
        /** @var array<int, BurndownPointData> One point per day from the start to today (or the end). */
        public array $burndown,
    ) {}
}
