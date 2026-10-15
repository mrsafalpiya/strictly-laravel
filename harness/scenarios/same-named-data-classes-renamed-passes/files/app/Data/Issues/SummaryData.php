<?php

namespace App\Data\Issues;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript(name: 'IssueSummaryData')]
final class SummaryData extends Data
{
    public function __construct(
        public int $open,
        public int $closed,
    ) {}
}
