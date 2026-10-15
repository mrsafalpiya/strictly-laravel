<?php

namespace App\Http\Controllers;

use App\Data\DashboardFiltersData;
use App\Pages\DashboardPage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class DashboardController extends Controller
{
    public function index(DashboardFiltersData $filters, Request $request): DashboardPage|RedirectResponse
    {
        if ($filters->tab === null && $request->input('tab') === 'stats') {
            return to_route('home');
        }

        return new DashboardPage;
    }
}
