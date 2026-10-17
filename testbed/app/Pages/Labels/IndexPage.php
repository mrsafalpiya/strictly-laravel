<?php

namespace App\Pages\Labels;

use App\Data\Labels\LabelListItemData;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    public function __construct(
        /** @var list<LabelListItemData> */
        public array $labels,
    ) {}
}
