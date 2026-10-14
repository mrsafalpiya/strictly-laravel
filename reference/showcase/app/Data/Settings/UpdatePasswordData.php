<?php

namespace App\Data\Settings;

use App\Support\Data\InputData;
use Illuminate\Validation\Rules\Password;

final class UpdatePasswordData extends InputData
{
    public function __construct(
        public string $currentPassword,
        public string $password,
        public string $passwordConfirmation,
    ) {}

    /**
     * @return array<string, list<mixed>>
     */
    public static function rules(): array
    {
        return [
            'currentPassword' => ['current_password'],
            'password' => [Password::default(), 'confirmed:passwordConfirmation'],
        ];
    }
}
