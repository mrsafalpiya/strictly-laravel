<?php

namespace App\Data\SavedViews;

use App\Data\Issues\IssueFiltersData;
use App\Models\SavedView;
use Spatie\LaravelData\Data;

final class SavedViewData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public IssueFiltersData $filters,
    ) {}

    public static function fromModel(SavedView $view): self
    {
        return new self(id: $view->id, name: $view->name, filters: $view->filters);
    }
}
