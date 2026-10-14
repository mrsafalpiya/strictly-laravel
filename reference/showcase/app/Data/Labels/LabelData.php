<?php

namespace App\Data\Labels;

use App\Enums\Color;
use App\Models\Label;
use Spatie\LaravelData\Data;

final class LabelData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public Color $color,
    ) {}

    public static function fromModel(Label $label): self
    {
        return new self(id: $label->id, name: $label->name, color: $label->color);
    }
}
