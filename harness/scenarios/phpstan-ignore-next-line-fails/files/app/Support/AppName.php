<?php

namespace App\Support;

final class AppName
{
    public static function shouted(): string
    {
        // @phpstan-ignore-next-line
        return strtoupper(config('app.name'));
    }
}
