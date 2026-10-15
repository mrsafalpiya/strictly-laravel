<?php

namespace App\Data;

use StrictlyLaravel\Data\InputData;

final class StoreTaskData extends InputData
{
    /**
     * @param  list<TaskData>  $subtasks
     */
    public function __construct(
        public TaskData $task,
        public array $subtasks,
    ) {}
}
