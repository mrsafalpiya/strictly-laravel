<?php

namespace App\Data;

use App\Enums\ChangeType;
use Spatie\LaravelData\Data;

final class PriorityChangedData extends Data
{
    public function __construct(
        public string $from,
        public string $to,
        /** @var ChangeType::Priority */
        public ChangeType $type = ChangeType::Priority,
    ) {}
}
