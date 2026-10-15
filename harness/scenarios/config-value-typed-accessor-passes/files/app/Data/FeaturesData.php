<?php

namespace App\Data;

use Spatie\LaravelData\Data;

/**
 * The feature flags every page receives (SharedProps::$features), from config/features.php.
 */
final class FeaturesData extends Data
{
    public function __construct(
        public bool $boards,
        public bool $reports,
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            boards: config()->boolean('features.boards'),
            reports: config()->boolean('features.reports'),
        );
    }
}
