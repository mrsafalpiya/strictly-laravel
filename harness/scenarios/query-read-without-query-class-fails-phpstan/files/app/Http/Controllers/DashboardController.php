<?php

namespace App\Http\Controllers;

use App\Pages\DashboardPage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class DashboardController extends Controller
{
    public function index(Request $request): DashboardPage|RedirectResponse
    {
        if ($request->query('tab') === 'stats') {
            return to_route('home');
        }

        return new DashboardPage;
    }
}
