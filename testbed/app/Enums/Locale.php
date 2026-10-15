<?php

namespace App\Enums;

/**
 * The locales Tracklane is translated into, each with its lang/<locale>/ files. English is the default (app.locale),
 * whose lang files type t(); the locale parity test keeps the others in step with it.
 */
enum Locale: string
{
    case English = 'en';
    case German = 'de';
}
