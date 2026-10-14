<?php

namespace App\Support\Data;

use Carbon\CarbonImmutable;
use DateTimeInterface;
use Spatie\LaravelData\Casts\Cast;
use Spatie\LaravelData\Casts\Uncastable;
use Spatie\LaravelData\Support\Creation\CreationContext;
use Spatie\LaravelData\Support\DataProperty;
use Spatie\LaravelData\Support\Transformation\TransformationContext;
use Spatie\LaravelData\Transformers\Transformer;

/**
 * A calendar date without time or timezone: "2026-10-14" in, "2026-10-14" out.
 * Use through the #[DateOnly] attribute.
 */
final class DateOnlyCast implements Cast, Transformer
{
    /**
     * @param  array<string, mixed>  $properties
     */
    public function cast(DataProperty $property, mixed $value, array $properties, CreationContext $context): CarbonImmutable|Uncastable
    {
        if ($value instanceof DateTimeInterface) {
            return CarbonImmutable::instance($value)->startOfDay();
        }

        if (! is_string($value)) {
            return Uncastable::create();
        }

        $date = CarbonImmutable::createFromFormat('!Y-m-d', $value);

        return $date instanceof CarbonImmutable ? $date : Uncastable::create();
    }

    public function transform(DataProperty $property, mixed $value, TransformationContext $context): mixed
    {
        return $value instanceof DateTimeInterface ? $value->format('Y-m-d') : $value;
    }
}
