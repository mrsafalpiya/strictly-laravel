<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class IssueData extends Data
{
    /**
     * @param  array<string, mixed>  $customFields  keyed by the custom field's name
     */
    public function __construct(
        public string $title,
        // Whatever the issue's integration attached: any JSON value.
        public mixed $meta,
        public array $customFields,
    ) {}
}
