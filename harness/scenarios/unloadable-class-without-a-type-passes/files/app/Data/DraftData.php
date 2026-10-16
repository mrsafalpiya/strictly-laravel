<?php

namespace App\Data;

use Spatie\TypeScriptTransformer\Attributes\Hidden;

/**
 * Deliberately left out of @/generated, so it doesn't matter that it can't be loaded.
 */
#[Hidden]
final class DraftData extends Dat
{
    public function __construct(
        public string $title,
    ) {}
}
