<?php

namespace App\Data;

use Spatie\LaravelData\Attributes\Validation\Confirmed;
use StrictlyLaravel\Data\InputData;

final class UpdatePasswordData extends InputData
{
    public function __construct(
        #[Confirmed]
        public string $password,
        public string $password_confirmation,
    ) {}

    /**
     * @return array<string, list<string>>
     */
    public static function rules(): array
    {
        return ['password' => ['min:8']];
    }
}
