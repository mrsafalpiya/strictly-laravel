<?php

namespace App\Support\Data;

use Attribute;
use Spatie\LaravelData\Attributes\WithCastAndTransformer;

/**
 * Marks a CarbonInterface property as a calendar date ("Y-m-d"), e.g. due dates.
 * Pair with #[DateFormat('Y-m-d')] on input data to validate the format.
 */
#[Attribute(Attribute::TARGET_PROPERTY)]
final class DateOnly extends WithCastAndTransformer
{
    public function __construct()
    {
        parent::__construct(DateOnlyCast::class);
    }
}
