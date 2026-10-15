<?php

namespace App\Data;

use StrictlyLaravel\Data\InputData;

final class StoreTaskData extends InputData
{
    public function __construct(
        public TaskData $task,
    ) {}
}
