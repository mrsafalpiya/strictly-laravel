<?php

use App\Http\Controllers\InvitationController;
use App\Http\Controllers\WorkspaceController;
use App\Models\User;
use App\Pages\WelcomePage;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => new WelcomePage)->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Sends the user to their last workspace, or to create their first one.
    Route::get('dashboard', function (#[CurrentUser] User $user) {
        $workspace = $user->currentWorkspace ?? $user->workspaces()->orderBy('name')->first();

        return $workspace === null
            ? to_route('workspaces.create')
            : to_route('workspace.dashboard', $workspace);
    })->name('dashboard');

    Route::get('workspaces/create', [WorkspaceController::class, 'create'])->name('workspaces.create');
    Route::post('workspaces', [WorkspaceController::class, 'store'])->name('workspaces.store');

    Route::get('invitations/{token}', [InvitationController::class, 'show'])->name('invitations.show');
    Route::post('invitations/{token}/accept', [InvitationController::class, 'accept'])->name('invitations.accept');

    // Everything inside a workspace. Each feature area owns one file in routes/workspace/.
    Route::prefix('w/{workspace}')
        ->middleware('workspace')
        ->scopeBindings()
        ->group(function () {
            foreach (File::glob(__DIR__.'/workspace/*.php') as $file) {
                require $file;
            }
        });
});

require __DIR__.'/settings.php';
