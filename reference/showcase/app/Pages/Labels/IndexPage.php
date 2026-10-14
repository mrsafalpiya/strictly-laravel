<?php

namespace App\Pages\Labels;

use App\Data\Labels\LabelListItemData;
use App\Support\Inertia\Page;

final class IndexPage extends Page
{
    public function __construct(
        /** @var array<int, LabelListItemData> */
        public array $labels,
    ) {}
}
