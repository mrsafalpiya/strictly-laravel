<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Behaviour tests leave some optional shapes empty (no status message, no passkeys, …), and a type is
 * only proven by the recorded contracts for values a test actually produced. These tests fill every
 * nullable, optional and list shape once; `php artisan types:coverage` lists what is still unverified
 * (composer test fails on it).
 */

test('auth and settings pages with a status message', function () {
    $this->withSession(['status' => 'We have emailed your password reset link.'])
        ->get(route('password.request'))
        ->assertInertia(fn (Assert $page) => $page->where('status', 'We have emailed your password reset link.'));

    $this->withSession(['status' => 'Your password has been reset.'])
        ->get(route('login'))
        ->assertInertia(fn (Assert $page) => $page->where('status', 'Your password has been reset.'));

    $this->actingAs(User::factory()->unverified()->create())
        ->withSession(['status' => 'verification-link-sent'])
        ->get(route('verification.notice'))
        ->assertInertia(fn (Assert $page) => $page->where('status', 'verification-link-sent'));

    $this->actingAs(User::factory()->create())
        ->withSession(['status' => 'verification-link-sent'])
        ->get(route('profile.edit'))
        ->assertInertia(fn (Assert $page) => $page->where('status', 'verification-link-sent'));
});

test('the security page lists passkeys', function () {
    $user = User::factory()->create();
    $user->passkeys()->create([
        'name' => 'MacBook Pro',
        'credential_id' => 'credential-1',
        'credential' => ['aaguid' => '00000000-0000-0000-0000-000000000000'],
    ]);
    $user->passkeys()->create([
        'name' => 'Phone',
        'credential_id' => 'credential-2',
        'credential' => ['aaguid' => 'a11a5faa-9f32-4b8c-8c5d-2f7d13e8c942'],
    ])->forceFill(['last_used_at' => now()->subDay()])->save();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('passkeys.0.name', 'MacBook Pro'));
});
