<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class MemberData extends Data
{
    public function __construct(
        public string $name,
        public string $email,
    ) {}
}
