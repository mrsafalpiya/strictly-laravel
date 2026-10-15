<?php

namespace App\Billing;

use App\Events\InvoicePaid;
use App\Models\User;
use App\Notifications\InvoicePaid as InvoicePaidNotification;

final class InvoicePayments
{
    public function paid(User $user, string $title): void
    {
        $user->notify(new InvoicePaidNotification($title));

        broadcast(new InvoicePaid($user, $title));
    }
}
