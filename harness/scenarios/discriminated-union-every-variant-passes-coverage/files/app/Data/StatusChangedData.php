<?php

namespace App\Data;

use App\Enums\ChangeType;
use Spatie\LaravelData\Data;

final class StatusChangedData extends Data
{
    public function __construct(
        public string $from,
        public string $to,
        /** @var ChangeType::Status */
        public ChangeType $type = ChangeType::Status,
    ) {}
}
