<?php

namespace App\Pages;

use App\Data\ReportData;
use StrictlyLaravel\Inertia\Page;

final class ReportsPage extends Page
{
    public function __construct(
        public string $title,
        public ReportData $report,
    ) {}
}
