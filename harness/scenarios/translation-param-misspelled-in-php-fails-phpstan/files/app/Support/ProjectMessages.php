<?php

namespace App\Support;

final class ProjectMessages
{
    public static function saved(string $key): string
    {
        return __('projects.flash.saved', ['kye' => $key]);
    }
}
