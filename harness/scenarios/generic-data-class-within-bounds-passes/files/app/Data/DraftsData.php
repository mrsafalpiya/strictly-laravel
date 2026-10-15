<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use StrictlyLaravel\Data\InputData;

/**
 * A form's saved drafts, newest first.
 *
 * @template TInput of InputData
 */
final class DraftsData extends Data
{
    /**
     * @param  list<TInput>  $drafts
     */
    public function __construct(
        public array $drafts,
    ) {}
}
