<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class IssueData extends Data
{
    /**
     * @param  array<string, mixed>  $customFields  keyed by the custom field's name
     * @param  list<mixed>  $history
     * @param  array{source: mixed, attempts: int}  $import
     * @param  array<string, list<mixed>>  $votes
     * @param  array<mixed>  $labels
     */
    public function __construct(
        public string $title,
        public mixed $meta,
        public array $customFields,
        public array $history,
        public array $import,
        public array $votes,
        public array $labels,
        // An array with no item type: PHPStan max rejects it in the app, but a vendor Data class can have one.
        public array $raw,
    ) {}
}
