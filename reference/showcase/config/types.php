<?php

use App\Data\Auth\ConfirmPasswordFormData;
use App\Data\Auth\EmptyFormData;
use App\Data\Auth\EnableTwoFactorFormData;
use App\Data\Auth\ForgotPasswordFormData;
use App\Data\Auth\LoginFormData;
use App\Data\Auth\RegisterFormData;
use App\Data\Auth\ResetPasswordFormData;
use App\Data\Auth\ResetPasswordLinkQueryData;
use App\Data\Auth\TwoFactorChallengeFormData;
use App\Data\Auth\TwoFactorCodeFormData;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\ConfirmablePasswordController;
use Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController;
use Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController;
use Laravel\Fortify\Http\Controllers\NewPasswordController;
use Laravel\Fortify\Http\Controllers\PasswordResetLinkController;
use Laravel\Fortify\Http\Controllers\RecoveryCodeController;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController;
use Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController;
use Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController;

return [

    /*
    |--------------------------------------------------------------------------
    | Payloads of controllers you don't own
    |--------------------------------------------------------------------------
    |
    | Wayfinder route functions are typed by the InputData parameter of the controller action
    | (App\Support\Wayfinder\RouteTypes). Vendor controllers (Fortify, …) don't have one, so their
    | payload is declared here: `Controller@method` => Data class (a QueryData class types a GET's query).
    |
    | The tests verify each declaration (tests/Support/InertiaContracts.php): every key the vendor
    | validates, reports an error for or reads must be a field of it, and `types:coverage` fails on a
    | declared field the vendor never validates or reads.
    |
    */

    'route_inputs' => [
        AuthenticatedSessionController::class.'@store' => LoginFormData::class,
        RegisteredUserController::class.'@store' => RegisterFormData::class,
        PasswordResetLinkController::class.'@store' => ForgotPasswordFormData::class,
        NewPasswordController::class.'@create' => ResetPasswordLinkQueryData::class,
        NewPasswordController::class.'@store' => ResetPasswordFormData::class,
        ConfirmablePasswordController::class.'@store' => ConfirmPasswordFormData::class,
        TwoFactorAuthenticatedSessionController::class.'@create' => TwoFactorChallengeFormData::class,
        TwoFactorAuthenticatedSessionController::class.'@store' => TwoFactorChallengeFormData::class,
        ConfirmedTwoFactorAuthenticationController::class.'@store' => TwoFactorCodeFormData::class,
        EmailVerificationNotificationController::class.'@store' => EmptyFormData::class,
        TwoFactorAuthenticationController::class.'@store' => EnableTwoFactorFormData::class,
        TwoFactorAuthenticationController::class.'@destroy' => EmptyFormData::class,
        RecoveryCodeController::class.'@store' => EmptyFormData::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Responses of JSON endpoints you don't own
    |--------------------------------------------------------------------------
    |
    | Your own JSON endpoints declare their response as the controller method's Data return type. Vendor ones are
    | declared here: `Controller@method` => Data class, or a TypeScript type for JSON that isn't one object. The
    | route is branded with it (useRouteHttp() returns it), and the tests check every response against it.
    |
    */

    'route_responses' => [
        TwoFactorQrCodeController::class.'@show' => '{ svg: string; url: string } | []',
        TwoFactorSecretKeyController::class.'@show' => '{ secretKey: string }',
        RecoveryCodeController::class.'@index' => 'string[]',
    ],

];
