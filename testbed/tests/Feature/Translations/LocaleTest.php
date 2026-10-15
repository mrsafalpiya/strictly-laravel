<?php

use Inertia\Testing\AssertableInertia as Assert;

test('pages are translated into English when the browser prefers no locale Tracklane has', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->withHeader('Accept-Language', 'fr-FR,fr;q=0.9')
        ->get(route('projects.index', $workspace))
        ->assertOk()
        ->assertSee('<html lang="en"', false)
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
});

test('pages are translated into German when the browser prefers it', function () {
    [$workspace, $user] = workspaceWith();

    // Only the locale's name is shared: the client's t() has its messages bundled as generated JSON.
    $this->actingAs($user)
        ->withHeader('Accept-Language', 'de-DE,de;q=0.9,en;q=0.8')
        ->get(route('projects.index', $workspace))
        ->assertOk()
        ->assertSee('<html lang="de"', false)
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'de'));
});

test('flash messages are translated into the request\'s locale', function () {
    [$workspace, $user, $project] = workspaceWith();

    $this->actingAs($user)
        ->withHeader('Accept-Language', 'de')
        ->patch(route('projects.update', [$workspace, $project]), [
            'name' => 'Webseite',
            'description' => null,
            'color' => 'teal',
            'leadId' => null,
        ])
        ->assertRedirect(route('projects.index', $workspace))
        ->assertInertiaFlash('toast.message', 'TRK gespeichert.');

    $this->actingAs($user)
        ->withHeader('Accept-Language', 'en')
        ->patch(route('projects.update', [$workspace, $project]), [
            'name' => 'Website',
            'description' => null,
            'color' => 'teal',
            'leadId' => null,
        ])
        ->assertInertiaFlash('toast.message', 'Saved TRK.');
});
