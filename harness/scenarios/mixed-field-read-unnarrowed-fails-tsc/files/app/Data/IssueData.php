<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class IssueData extends Data
{
    public function __construct(
        public string $title,
        // Whatever the issue's integration attached: any JSON value.
        public mixed $meta,
    ) {}
}
