<?php

namespace App\Pages\Labels;

use App\Data\LabelData;
use StrictlyLaravel\Inertia\Page;

final class IndexPage extends Page
{
    /**
     * @param  list<LabelData>  $labels  the labels that aren't archived
     */
    public function __construct(
        public array $labels,
    ) {}
}
