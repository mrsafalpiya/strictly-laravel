<?php

namespace App\Data\Board;

use StrictlyLaravel\Data\QueryData;

/** `board?project=TRK` limits the board to one project. */
final class BoardQueryData extends QueryData
{
    public function __construct(
        public ?string $project = null,
    ) {}
}
