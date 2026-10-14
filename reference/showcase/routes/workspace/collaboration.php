<?php

use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SavedViewController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

// Nested under the issue so scoped bindings prove the comment/attachment belongs to this workspace.
Route::prefix('projects/{project}/issues/{issue}')->group(function () {
    Route::post('comments', [CommentController::class, 'store'])->name('comments.store');
    Route::patch('comments/{comment}', [CommentController::class, 'update'])->name('comments.update');
    Route::delete('comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
    Route::post('comments/{comment}/reactions', [CommentController::class, 'react'])->name('comments.react');

    Route::post('attachments', [AttachmentController::class, 'store'])->name('attachments.store');
    Route::get('attachments/{attachment}', [AttachmentController::class, 'show'])->name('attachments.show');
    Route::delete('attachments/{attachment}', [AttachmentController::class, 'destroy'])->name('attachments.destroy');
});

// Notifications belong to the user, not the workspace. (A withoutScopedBindings() *group* inside the
// scopeBindings() workspace group has no effect, so the controller resolves them through the user.)
Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
Route::post('notifications/read', [NotificationController::class, 'readAll'])->name('notifications.read-all');
Route::patch('notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');

Route::get('search', SearchController::class)->name('search');

Route::post('views', [SavedViewController::class, 'store'])->name('views.store');
Route::delete('views/{savedView}', [SavedViewController::class, 'destroy'])->name('views.destroy');
