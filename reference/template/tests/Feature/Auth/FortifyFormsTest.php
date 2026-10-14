<?php

use App\Data\Auth\ConfirmPasswordFormData;
use App\Data\Auth\TwoFactorChallengeFormData;
use App\Data\Auth\TwoFactorCodeFormData;
use App\Models\User;
use Laravel\Fortify\Features;

/*
 * Submits every Fortify form at least once, with payloads built from the Data classes declared for them
 * in config/types.php: a misnamed declared field makes the request fail. `types:coverage` also requires each
 * declared field to be validated (or reported as an error) by Fortify in some test.
 */

test('the password can be confirmed', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('password.confirm.store'), (new ConfirmPasswordFormData(password: 'password'))->toArray())
        ->assertRedirect();

    $this->actingAs(User::factory()->create())
        ->post(route('password.confirm.store'), (new ConfirmPasswordFormData(password: 'wrong'))->toArray())
        ->assertSessionHasErrors('password');
});

test('two-factor login accepts a recovery code', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $user = User::factory()->withTwoFactor()->create();

    $this->withSession(['login.id' => $user->id, 'login.remember' => false])
        ->post(route('two-factor.login.store'), (new TwoFactorChallengeFormData(code: null, recovery_code: 'recovery-code-1'))->toArray())
        ->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($user);
});

test('two-factor authentication can be enabled, confirmed, given new codes and disabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $user = User::factory()->create();
    $confirmed = ['auth.password_confirmed_at' => time()];

    $this->actingAs($user)->withSession($confirmed)->post(route('two-factor.enable'))->assertRedirect();
    expect($user->refresh()->two_factor_secret)->not->toBeNull();

    $this->actingAs($user)->withSession($confirmed)
        ->post(route('two-factor.confirm'), (new TwoFactorCodeFormData(code: '000000'))->toArray())
        ->assertSessionHasErrorsIn('confirmTwoFactorAuthentication', 'code');

    $this->actingAs($user)->withSession($confirmed)->post(route('two-factor.regenerate-recovery-codes'))->assertRedirect();

    $this->actingAs($user)->withSession($confirmed)->delete(route('two-factor.disable'))->assertRedirect();
    expect($user->refresh()->two_factor_secret)->toBeNull();
});

test('the two-factor setup endpoints answer with the JSON declared for them', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $confirmed = ['auth.password_confirmed_at' => time()];
    $endpoints = ['two-factor.qr-code', 'two-factor.secret-key', 'two-factor.recovery-codes'];

    // Before setup Fortify answers `[]` (part of the declared types in config/types.php).
    $this->actingAs(User::factory()->create())->withSession($confirmed)
        ->getJson(route('two-factor.qr-code'))
        ->assertOk()
        ->assertExactJson([]);

    $user = User::factory()->withTwoFactor()->create();

    foreach ($endpoints as $endpoint) {
        $this->actingAs($user)->withSession($confirmed)->getJson(route($endpoint))->assertOk();
    }
});
