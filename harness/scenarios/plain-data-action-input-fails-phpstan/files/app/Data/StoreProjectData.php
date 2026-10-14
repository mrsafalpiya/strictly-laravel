<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class StoreProjectData extends Data
{
    public function __construct(
        public string $slug,
    ) {}

    /**
     * @return array<string, list<string>>
     */
    public static function rules(): array
    {
        return ['slug' => ['unique:projects']];
    }
}
