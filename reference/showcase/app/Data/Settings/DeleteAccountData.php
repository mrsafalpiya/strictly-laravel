<?php

namespace App\Data\Settings;

use App\Support\Data\InputData;

final class DeleteAccountData extends InputData
{
    public function __construct(
        public string $password,
    ) {}

    /**
     * @return array<string, list<mixed>>
     */
    public static function rules(): array
    {
        return [
            'password' => ['current_password'],
        ];
    }
}
