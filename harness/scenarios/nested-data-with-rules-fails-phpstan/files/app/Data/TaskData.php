<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class TaskData extends Data
{
    public function __construct(
        public string $title,
    ) {}

    /**
     * @return array<string, list<string>>
     */
    public static function rules(): array
    {
        return ['title' => ['max:50']];
    }
}
