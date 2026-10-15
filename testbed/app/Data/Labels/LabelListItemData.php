<?php

namespace App\Data\Labels;

use App\Enums\Color;
use App\Models\Label;
use Spatie\LaravelData\Data;

/** A row on the labels page: the label plus how many issues use it. */
final class LabelListItemData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public Color $color,
        public int $issuesCount,
    ) {}

    /** Requires issues_count. */
    public static function fromModel(Label $label): self
    {
        return new self(id: $label->id, name: $label->name, color: $label->color, issuesCount: $label->issues_count ?? 0);
    }
}
