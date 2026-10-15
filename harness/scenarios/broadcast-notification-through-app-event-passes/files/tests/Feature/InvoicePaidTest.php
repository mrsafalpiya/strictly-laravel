<?php

use App\Billing\InvoicePayments;
use App\Events\InvoicePaid;
use App\Models\User;
use Illuminate\Support\Facades\Event;

test('paying an invoice broadcasts it to the user alongside the notification', function () {
    $user = User::factory()->create();
    $broadcast = collect();
    Event::listen(InvoicePaid::class, fn (InvoicePaid $event) => $broadcast->push($event));

    app(InvoicePayments::class)->paid($user, 'Invoice #1042 paid');

    expect($broadcast)->toHaveCount(1);
});
