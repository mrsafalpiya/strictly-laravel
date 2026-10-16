<?php

namespace App\Data;

use Spatie\LaravelData\Data;

/**
 * The JSON response of the issue preview endpoint.
 */
final class IssuePreviewData extends Data
{
    /**
     * @param  list<mixed>  $blocks
     */
    public function __construct(
        public string $html,
        public array $blocks,
        public mixed $warnings,
    ) {}
}
