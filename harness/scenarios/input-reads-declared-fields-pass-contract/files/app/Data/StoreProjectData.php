<?php

namespace App\Data;

use StrictlyLaravel\Data\InputData;

final class StoreProjectData extends InputData
{
    /**
     * @param  list<string>  $tags
     */
    public function __construct(
        public string $name,
        public bool $public,
        public array $tags,
        public ProjectSettingsData $settings,
    ) {}
}
