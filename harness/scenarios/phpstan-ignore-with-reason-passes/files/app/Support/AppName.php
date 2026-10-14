<?php

namespace App\Support;

final class AppName
{
    public static function shouted(): string
    {
        // @phpstan-ignore argument.type (config/app.php always sets a string name)
        return strtoupper(config('app.name'));
    }
}
