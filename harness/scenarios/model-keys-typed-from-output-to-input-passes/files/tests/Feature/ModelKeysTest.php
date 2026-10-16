<?php

use App\Models\Issue;
use App\Models\User;

beforeEach(function () {
    // The pages aren't in the app's Vite build.
    $this->withoutVite();
});

test('the issues page lists assigned and unassigned issues', function () {
    $user = User::factory()->create();
    Issue::query()->create(['number' => 1, 'title' => 'Kick-off', 'assignee_id' => $user->id]);
    Issue::query()->create(['number' => 2, 'title' => 'Retro', 'assignee_id' => null]);

    $this->actingAs($user)->get(route('issues.index'))->assertOk();
});

test('an issue page shows an assigned and an unassigned issue', function () {
    $user = User::factory()->create();
    $assigned = Issue::query()->create(['number' => 1, 'title' => 'Kick-off', 'assignee_id' => $user->id]);
    $unassigned = Issue::query()->create(['number' => 2, 'title' => 'Retro', 'assignee_id' => null]);

    $this->actingAs($user)->get(route('issues.show', $assigned))->assertOk();
    $this->actingAs($user)->get(route('issues.show', $unassigned))->assertOk();
});

test('the selected issues are assigned and unassigned by their ids', function () {
    $user = User::factory()->create();
    $issue = Issue::query()->create(['number' => 1, 'title' => 'Kick-off', 'assignee_id' => null]);

    $this->actingAs($user)
        ->from(route('issues.index'))
        ->patch(route('issues.bulk-update'), ['ids' => [$issue->id], 'assigneeId' => $user->id])
        ->assertRedirect(route('issues.index'))
        ->assertSessionHasNoErrors();

    expect($issue->refresh()->assignee_id)->toBe($user->id);

    $this->actingAs($user)
        ->patch(route('issues.bulk-update'), ['ids' => [$issue->id], 'assigneeId' => null])
        ->assertSessionHasNoErrors();

    expect($issue->refresh()->assignee_id)->toBeNull();
});

test('an issue number is no issue id', function () {
    $user = User::factory()->create();
    $issue = Issue::query()->create(['number' => 1, 'title' => 'Kick-off', 'assignee_id' => null]);

    $this->actingAs($user)
        ->patch(route('issues.bulk-update'), ['ids' => [$issue->number], 'assigneeId' => $user->id])
        ->assertSessionHasErrors(['ids.0']);
});
