<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class InvoicePaidData extends Data
{
    public function __construct(
        public string $title,
    ) {}
}
