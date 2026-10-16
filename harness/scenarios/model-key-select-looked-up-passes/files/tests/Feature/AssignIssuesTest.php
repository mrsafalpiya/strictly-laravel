<?php

use App\Models\Issue;
use App\Models\User;

beforeEach(function () {
    // The page isn't in the app's Vite build.
    $this->withoutVite();
});

test('the issues page lists the issues and the members to assign them to', function () {
    $user = User::factory()->create();
    Issue::query()->create(['number' => 1, 'title' => 'Kick-off', 'assignee_id' => $user->id]);
    Issue::query()->create(['number' => 2, 'title' => 'Retro', 'assignee_id' => null]);

    $this->actingAs($user)->get(route('issues.index'))->assertOk();
});

test('the selected issues are assigned to the member picked, or unassigned', function () {
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

test('an assignee must be a member', function () {
    $user = User::factory()->create();
    $issue = Issue::query()->create(['number' => 1, 'title' => 'Kick-off', 'assignee_id' => null]);

    $this->actingAs($user)
        ->patch(route('issues.bulk-update'), ['ids' => [$issue->id], 'assigneeId' => $user->id + 1])
        ->assertSessionHasErrors(['assigneeId']);
});
