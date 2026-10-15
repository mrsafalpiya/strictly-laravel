<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\WorkspaceSettingsController;
use Illuminate\Support\Facades\Route;

Route::get('/', DashboardController::class)->name('workspace.dashboard');

Route::get('settings', [WorkspaceSettingsController::class, 'edit'])->name('workspace.settings.edit');
Route::patch('settings', [WorkspaceSettingsController::class, 'update'])->name('workspace.settings.update');
Route::delete('/', [WorkspaceSettingsController::class, 'destroy'])->name('workspace.destroy');

Route::get('members', [MemberController::class, 'index'])->name('members.index');
Route::patch('members/{membership}', [MemberController::class, 'update'])->name('members.update');
Route::delete('members/{membership}', [MemberController::class, 'destroy'])->name('members.destroy');

Route::post('invitations', [InvitationController::class, 'store'])->name('invitations.store');
Route::delete('invitations/{invitation}', [InvitationController::class, 'destroy'])->name('invitations.destroy');
