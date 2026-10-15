<?php

use App\Http\Controllers\InvitationController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\WorkspaceSettingsController;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;

// The workspace's home. Until the dashboard is ported (the Board area), it is the projects list.
Route::get('/', fn (Workspace $workspace): RedirectResponse => to_route('projects.index', $workspace))->name('workspace.dashboard');

Route::get('settings', [WorkspaceSettingsController::class, 'edit'])->name('workspace.settings.edit');
Route::patch('settings', [WorkspaceSettingsController::class, 'update'])->name('workspace.settings.update');
Route::delete('/', [WorkspaceSettingsController::class, 'destroy'])->name('workspace.destroy');

Route::get('members', [MemberController::class, 'index'])->name('members.index');
Route::patch('members/{membership}', [MemberController::class, 'update'])->name('members.update');
Route::delete('members/{membership}', [MemberController::class, 'destroy'])->name('members.destroy');

Route::post('invitations', [InvitationController::class, 'store'])->name('invitations.store');
Route::delete('invitations/{invitation}', [InvitationController::class, 'destroy'])->name('invitations.destroy');
