<?php

namespace App\Data;

use Spatie\LaravelData\Data;

/**
 * The feature flags every page receives (SharedProps::$features), from config/tracklane.php.
 */
final class FeaturesData extends Data
{
    public function __construct(
        public bool $cycles,
        public bool $labels,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            cycles: self::enabled('cycles'),
            labels: self::enabled('labels'),
        );
    }

    public static function enabled(string $feature): bool
    {
        return config()->boolean("tracklane.features.{$feature}");
    }
}
