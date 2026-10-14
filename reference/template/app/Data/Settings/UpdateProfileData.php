<?php

namespace App\Data\Settings;

use App\Models\User;
use App\Support\Data\InputData;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\Max;

final class UpdateProfileData extends InputData
{
    public function __construct(
        #[Max(255)]
        public string $name,
        #[Email, Max(255)]
        public string $email,
    ) {}

    /**
     * @return array<string, list<mixed>>
     */
    public static function rules(): array
    {
        return [
            'email' => [Rule::unique(User::class)->ignore(Auth::id())],
        ];
    }
}
