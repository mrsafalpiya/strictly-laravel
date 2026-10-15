<?php

namespace App\Data;

use Spatie\LaravelData\Data;

/**
 * The options of a select, from any backed enum.
 *
 * @template TValue of \BackedEnum
 */
final class ChoiceData extends Data
{
    /**
     * @param  list<TValue>  $options
     */
    public function __construct(
        public string $label,
        public array $options,
    ) {}
}
