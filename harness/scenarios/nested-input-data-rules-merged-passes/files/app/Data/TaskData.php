<?php

namespace App\Data;

use StrictlyLaravel\Data\InputData;

final class TaskData extends InputData
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
