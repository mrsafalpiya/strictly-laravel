<?php

namespace App\Data;

use StrictlyLaravel\Data\InputData;

final class StoreIssueData extends InputData
{
    /**
     * @param  array<string, mixed>  $customFields
     */
    public function __construct(
        public string $title,
        public array $customFields,
        public mixed $attachment,
    ) {}
}
