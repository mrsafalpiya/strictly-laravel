<?php

namespace App\Data;

use Spatie\LaravelData\Data;

final class ProjectSettingsData extends Data
{
    public function __construct(
        public bool $notifyOnAssign,
    ) {}
}
