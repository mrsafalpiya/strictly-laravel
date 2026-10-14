<?php

namespace App\Data;

use App\Enums\ActivityType;
use Spatie\LaravelData\Data;

final class CommentedActivityData extends Data
{
    /**
     * @param  ActivityType::Commented  $type
     */
    public function __construct(
        public ActivityType $type,
        public string $body,
    ) {}
}
