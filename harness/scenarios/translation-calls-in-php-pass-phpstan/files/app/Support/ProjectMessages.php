<?php

namespace App\Support;

use Illuminate\Support\Facades\Lang;

final class ProjectMessages
{
    public static function saved(string $key): string
    {
        return __('projects.flash.saved', ['key' => $key]);
    }

    public static function issues(string $key, int $count): string
    {
        return trans_choice('projects.issues', $count, ['key' => $key]);
    }

    public static function welcome(string $name): string
    {
        return __('Welcome back, :name!', ['name' => $name]);
    }

    public static function required(): string
    {
        return Lang::get('validation.required', ['attribute' => 'name']);
    }

    public static function archived(bool $archived, string $key): string
    {
        return __($archived ? 'projects.flash.saved' : 'Project :key restored.', ['key' => $key]);
    }
}
