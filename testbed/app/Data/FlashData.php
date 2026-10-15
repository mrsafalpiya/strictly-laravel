<?php

namespace App\Data;

use App\Enums\ToastType;
use Spatie\LaravelData\Optional;
use StrictlyLaravel\Inertia\Flash;

/**
 * What a response flashes to the next page the browser shows, typed as `usePage().flash` and the router's `flash`
 * event. Flash through this class: add a property here to flash something new.
 */
final class FlashData extends Flash
{
    public function __construct(
        public Optional|ToastData $toast = new Optional,
    ) {}

    /**
     * Show a toast on the next page, which is the page a redirect leads to.
     */
    public static function toast(ToastType $type, string $message): void
    {
        (new self(toast: new ToastData($type, $message)))->flash();
    }

    public static function success(string $message): void
    {
        self::toast(ToastType::Success, $message);
    }

    /** A refusal that isn't about a field of the request's input (those are validation errors). */
    public static function error(string $message): void
    {
        self::toast(ToastType::Error, $message);
    }
}
