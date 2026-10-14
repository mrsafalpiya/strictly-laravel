<?php

namespace App\Support\Inertia;

use App\Data\FlashData;
use App\Data\ToastData;
use App\Enums\ToastType;
use Inertia\Inertia;

/**
 * Typed writer for Inertia flash data. Every key written here must exist on App\Data\FlashData,
 * which is what the frontend sees as `page.flash` (InertiaConfig['flashDataType']).
 */
final class Flash
{
    public static function toast(ToastType $type, string $message): void
    {
        self::put(new FlashData(toast: new ToastData($type, $message)));
    }

    public static function success(string $message): void
    {
        self::toast(ToastType::Success, $message);
    }

    public static function error(string $message): void
    {
        self::toast(ToastType::Error, $message);
    }

    private static function put(FlashData $data): void
    {
        /** @var array<string, mixed> $flash Data objects always transform to string-keyed arrays. */
        $flash = $data->toArray();

        Inertia::flash($flash);
    }
}
