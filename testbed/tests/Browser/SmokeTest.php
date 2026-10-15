<?php

use App\Models\Comment;
use App\Models\Issue;
use App\Models\Label;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use StrictlyLaravel\Inertia\PageLocations;
use Tests\Browser\Support\PageRoutes;
use Tests\Browser\Support\Smoke;
use Tests\Browser\Support\SmokeData;

/*
|--------------------------------------------------------------------------
| Smoke test
|--------------------------------------------------------------------------
|
| Tracklane in a headless browser, against a production build (`pnpm run build`). Run it with `composer test:smoke`.
| Every step must leave no console error or warning, no uncaught error and no failed request (Tests\Browser\Support\
| Smoke). Not part of `ci:check`, which runs without a build or a browser.
|
*/

test('every page renders without a console error or a failed request', function () {
    $data = SmokeData::seed();
    $smoke = Smoke::watch();

    // A route's parameters, by name. The token is the invitation's; the reset-password page renders with any token.
    $values = [
        'workspace' => $data->workspace,
        'project' => $data->project,
        'issue' => $data->issue,
        'cycle' => $data->cycle,
        'token' => $data->invitation->token,
    ];
    $problems = [];
    $load = function (Pest\Browser\Api\PendingAwaitablePage $page, string $url, string $as) use ($smoke, &$problems): void {
        $smoke->go($page, $url);
        $found = $smoke->problems($page);

        if ($found !== []) {
            $problems["GET {$url} as {$as}"] = $found;
        }
    };

    $page = $smoke->open('/');

    foreach (PageRoutes::forGuests() as $route) {
        $load($page, PageRoutes::url($route, $values), 'a guest');
    }

    // Signing up through its form leads to the page asking to verify the email address.
    $page = $smoke->open('/register');
    $page->fill('name', 'Nina New')
        ->fill('email', 'nina@example.com')
        ->fill('password', 'a-long-new-password')
        ->fill('password_confirmation', 'a-long-new-password')
        ->press('@register-user-button');
    $smoke->assertComponent($page, 'auth/verify-email');
    $smoke->assertClean($page, 'Signing up');

    // A user with two-factor authentication is asked for a code, or a recovery code, after the password.
    $twoFactor = User::factory()->withTwoFactor()->create();
    $page = $smoke->logIn($twoFactor->email, SmokeData::PASSWORD);
    $smoke->assertComponent($page, 'auth/two-factor-challenge');
    $page->click('login using a recovery code')
        ->fill('recovery_code', 'recovery-code-1')
        ->press('Continue');
    $smoke->assertComponent($page, 'workspaces/create');
    $smoke->assertClean($page, 'Logging in with a recovery code');

    $page = $smoke->logIn($data->user->email, SmokeData::PASSWORD);
    $smoke->assertComponent($page, 'workspaces/dashboard');
    $smoke->assertClean($page, 'Logging in');

    foreach (PageRoutes::forUsers() as $route) {
        $load($page, PageRoutes::url($route, $values), 'a user');
    }

    // The security settings ask for the password first.
    $smoke->go($page, '/settings/security');
    $smoke->assertComponent($page, 'auth/confirm-password');
    $page->fill('password', SmokeData::PASSWORD)->press('@confirm-password-button');
    $smoke->assertComponent($page, 'settings/security');
    $smoke->assertClean($page, 'Confirming the password');

    expect($problems)->toBe([], 'These pages were not clean.');

    $unrendered = array_values(array_diff(array_keys(PageLocations::pages()), $smoke->components()));
    expect($unrendered)->toBe([], 'The smoke test never rendered these pages: give them a GET route it loads, or reach them in this test.');
});

test('an issue is created through its typed form, after its validation errors show', function () {
    $data = SmokeData::seed();
    $smoke = Smoke::watch();
    $page = $smoke->logIn($data->user->email, SmokeData::PASSWORD);

    $smoke->go($page, "/w/{$data->workspace->slug}/issues/create");
    $page->press('Create issue');
    $page->assertSee('The project id field is required.')
        ->assertSee('The title field is required.');

    $page->click('[aria-label="Project"]')
        ->click('internal:role=option[name="TRK · Tracklane"i]')
        ->fill('title', 'Created by the smoke test')
        ->press('Create issue');
    $smoke->assertComponent($page, 'issues/show');
    $page->assertSee('Created TRK-');
    $smoke->assertClean($page, 'Creating an issue');

    expect(Issue::query()->where('title', 'Created by the smoke test')->exists())->toBeTrue();
});

test('a label is created through TypedForm', function () {
    $data = SmokeData::seed();
    $smoke = Smoke::watch();
    $page = $smoke->logIn($data->user->email, SmokeData::PASSWORD);

    $smoke->go($page, "/w/{$data->workspace->slug}/labels");
    $page->fill('name', 'smoke')->press('Add label');
    $page->assertSee('smoke');
    $smoke->assertClean($page, 'Creating a label');

    expect(Label::query()->where('name', 'smoke')->exists())->toBeTrue();
});

test('the password is changed through its form', function () {
    $data = SmokeData::seed();
    $smoke = Smoke::watch();
    $page = $smoke->logIn($data->user->email, SmokeData::PASSWORD);

    $smoke->go($page, '/settings/security');
    $page->fill('password', SmokeData::PASSWORD)->press('@confirm-password-button');
    $smoke->assertComponent($page, 'settings/security');
    $page->fill('current_password', SmokeData::PASSWORD)
        ->fill('password', 'a-brand-new-password')
        ->fill('password_confirmation', 'a-brand-new-password')
        ->press('@update-password-button');
    $page->assertSee('Password updated.');
    $smoke->assertClean($page, 'Changing the password');

    expect(Hash::check('a-brand-new-password', (string) $data->user->fresh()?->password))->toBeTrue();
});

test('an issue is edited inline and commented on', function () {
    $data = SmokeData::seed();
    $smoke = Smoke::watch();
    $page = $smoke->logIn($data->user->email, SmokeData::PASSWORD);

    $smoke->go($page, "/w/{$data->workspace->slug}/projects/TRK/issues/{$data->issue->number}");

    $page->fill('[aria-label="Title"]', 'Renamed inline')->keys('[aria-label="Title"]', 'Tab');
    $page->assertScript('window.history.state.page.props.issue.title', 'Renamed inline');

    $page->click('[aria-label="Status"]')->click('internal:role=option[name="In review"i]');
    $page->assertScript('window.history.state.page.props.issue.status', 'in_review');

    $page->fill('[aria-label="New comment"]', 'Commented by the smoke test')->press('Comment');
    $page->assertSee('Commented by the smoke test');
    $smoke->assertClean($page, 'Editing an issue inline');

    $issue = $data->issue->fresh();
    expect($issue?->title)->toBe('Renamed inline')
        ->and($issue?->status->value)->toBe('in_review')
        ->and(Comment::query()->where('body', 'Commented by the smoke test')->exists())->toBeTrue();
});

test('the command palette finds an issue and opens it', function () {
    $data = SmokeData::seed();
    $smoke = Smoke::watch();
    $page = $smoke->logIn($data->user->email, SmokeData::PASSWORD);

    $page->keys('#app', 'Control+k');
    $page->fill('[aria-label="Search"]', $data->issue->title);
    $page->assertPresent("internal:role=option[name=\"TRK-{$data->issue->number} {$data->issue->title}\"i]");
    $page->keys('[aria-label="Search"]', 'Enter');
    $smoke->assertComponent($page, 'issues/show');
    $page->assertScript('window.history.state.page.props.issue.number', $data->issue->number);
    $smoke->assertClean($page, 'Searching from the command palette');
});

test('the activity feed loads more as it scrolls', function () {
    $data = SmokeData::seed();
    $smoke = Smoke::watch();
    $page = $smoke->logIn($data->user->email, SmokeData::PASSWORD);
    $total = $data->workspace->activities()->count();

    $smoke->go($page, "/w/{$data->workspace->slug}/activity");
    $page->assertScript('window.history.state.page.props.activity.data.length', App\Http\Controllers\ActivityController::PER_PAGE);

    $page->script("document.querySelector('main [data-infinite-scroll], main').scrollIntoView({ block: 'end' })");
    $page->script('window.scrollTo(0, document.documentElement.scrollHeight)');
    $page->assertScript('window.history.state.page.props.activity.data.length', $total)
        ->assertSee("That's everything.");
    $smoke->assertClean($page, 'Scrolling the activity feed');
});
