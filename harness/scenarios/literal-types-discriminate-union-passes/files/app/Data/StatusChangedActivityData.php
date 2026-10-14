<?php

namespace App\Data;

use App\Enums\ActivityType;
use Spatie\LaravelData\Data;

final class StatusChangedActivityData extends Data
{
    /**
     * @param  ActivityType::StatusChanged  $type
     */
    public function __construct(
        public ActivityType $type,
        public string $from,
        public string $to,
    ) {}
}
