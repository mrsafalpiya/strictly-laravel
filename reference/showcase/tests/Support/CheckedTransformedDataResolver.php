<?php

namespace Tests\Support;

use Spatie\LaravelData\Resolvers\TransformedDataResolver;
use Spatie\LaravelData\Support\DataProperty;
use Spatie\LaravelData\Support\Transformation\TransformationContext;

/** laravel-data's serialisation, checking the route-key brand of every property it sends (RouteKeyChecks). */
final class CheckedTransformedDataResolver extends TransformedDataResolver
{
    protected function resolvePropertyValue(DataProperty $property, mixed $value, TransformationContext $currentContext, ?TransformationContext $fieldContext): mixed
    {
        RouteKeyChecks::check($property->className, $property->name, $value);

        return parent::resolvePropertyValue($property, $value, $currentContext, $fieldContext);
    }
}
