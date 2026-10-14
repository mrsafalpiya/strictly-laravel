<?php

namespace App\Http\Controllers\Settings;

use App\Data\Settings\PasskeyData;
use App\Data\Settings\UpdatePasswordData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use App\Models\User;
use App\Pages\Settings\SecurityPage;
use App\Support\Inertia\Flash;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Features;

class SecurityController extends Controller
{
    /**
     * Show the user's security settings page.
     */
    public function edit(TwoFactorAuthenticationRequest $request, #[CurrentUser] User $user): SecurityPage
    {
        $canManageTwoFactor = Features::canManageTwoFactorAuthentication();

        if ($canManageTwoFactor) {
            $request->ensureStateIsValid();
        }

        return new SecurityPage(
            passwordRules: Password::defaults()->toPasswordRulesString(),
            canManageTwoFactor: $canManageTwoFactor,
            twoFactorEnabled: $canManageTwoFactor && $user->hasEnabledTwoFactorAuthentication(),
            requiresConfirmation: $canManageTwoFactor && Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm'),
            canManagePasskeys: Features::canManagePasskeys(),
            passkeys: Features::canManagePasskeys()
                ? $user->passkeys()
                    ->select(['id', 'name', 'credential', 'created_at', 'last_used_at'])
                    ->latest()
                    ->get()
                    ->map(PasskeyData::fromModel(...))
                    ->values()
                    ->all()
                : [],
        );
    }

    /**
     * Update the user's password.
     */
    public function update(UpdatePasswordData $data, #[CurrentUser] User $user): RedirectResponse
    {
        $user->update([
            'password' => $data->password,
        ]);

        Flash::success(__('Password updated.'));

        return back();
    }
}
