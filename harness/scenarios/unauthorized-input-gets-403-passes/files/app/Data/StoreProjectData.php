<?php

namespace App\Data;

use Illuminate\Support\Facades\Gate;
use StrictlyLaravel\Data\InputData;

final class StoreProjectData extends InputData
{
    public function __construct(
        public string $name,
    ) {}

    public static function authorize(): bool
    {
        return Gate::allows('create-projects');
    }
}
