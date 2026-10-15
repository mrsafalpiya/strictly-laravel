<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class EntryData extends Data
{
    public function __construct(
        public string $title,
        public ?string $note,
    ) {}
}
