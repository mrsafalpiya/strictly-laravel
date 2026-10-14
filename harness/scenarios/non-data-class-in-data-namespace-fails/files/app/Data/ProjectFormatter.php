<?php

namespace App\Data;

final class ProjectFormatter
{
    public static function title(string $name): string
    {
        return ucfirst($name);
    }
}
