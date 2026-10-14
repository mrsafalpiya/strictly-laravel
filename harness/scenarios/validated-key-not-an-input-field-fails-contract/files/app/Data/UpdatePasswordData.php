<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Confirmed;
use StrictlyLaravel\Data\InputData;

final class UpdatePasswordData extends InputData
{
    public function __construct(
        #[Confirmed]
        public string $password,
    ) {}
}
