<?php

namespace App\Reports;

use Spatie\LaravelData\Data;

final class ReportData extends Data implements Wireabl
{
    public function __construct(
        public string $title,
    ) {}
}
