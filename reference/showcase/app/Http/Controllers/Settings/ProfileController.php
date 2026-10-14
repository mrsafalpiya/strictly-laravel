<?php

namespace App\Http\Controllers\Settings;

use App\Data\Settings\DeleteAccountData;
use App\Data\Settings\UpdateProfileData;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Pages\Settings\ProfilePage;
use App\Support\Inertia\Flash;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Features;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request, #[CurrentUser] User $user): ProfilePage
    {
        $status = $request->session()->get('status');

        return new ProfilePage(
            mustVerifyEmail: Features::enabled(Features::emailVerification()),
            status: is_string($status) ? $status : null,
        );
    }

    /**
     * Update the user's profile information.
     */
    public function update(UpdateProfileData $data, #[CurrentUser] User $user): RedirectResponse
    {
        $user->fill(['name' => $data->name, 'email' => $data->email]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Flash::success(__('Profile updated.'));

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(DeleteAccountData $data, Request $request, #[CurrentUser] User $user): RedirectResponse
    {
        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
