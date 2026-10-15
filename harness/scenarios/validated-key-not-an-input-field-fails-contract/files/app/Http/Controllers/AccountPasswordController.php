<?php

namespace App\Http\Controllers;

use App\Data\UpdatePasswordData;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;

final class AccountPasswordController extends Controller
{
    public function __invoke(UpdatePasswordData $data, #[CurrentUser] User $user): RedirectResponse
    {
        $user->update(['password' => $data->password]);

        return to_route('dashboard');
    }
}
