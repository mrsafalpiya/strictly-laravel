<?php

namespace App\Data;

use StrictlyLaravel\Data\InputData;

final class StoreProjectData extends InputData
{
    /**
     * @param  list<string>  $tags
     * @param  list<TaskInputData>  $tasks
     */
    public function __construct(
        public string $name,
        public ?string $description,
        public int $estimate,
        public array $tags,
        public ProjectSettingsData $settings,
        public array $tasks,
    ) {}
}
