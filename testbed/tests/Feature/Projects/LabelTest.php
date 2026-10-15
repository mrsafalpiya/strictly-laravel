<?php

use App\Enums\Color;
use App\Enums\WorkspaceRole;
use App\Models\Issue;
use App\Models\Label;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('labels page lists labels with usage counts', function () {
    [$workspace, $user, $project] = workspaceWith();
    $bug = Label::factory()->create(['workspace_id' => $workspace->id, 'name' => 'bug', 'color' => Color::Red]);
    Label::factory()->create(['workspace_id' => $workspace->id, 'name' => 'chore']);
    Label::factory()->create(['name' => 'elsewhere']);
    Issue::factory(2)->create(['project_id' => $project->id])->each(fn (Issue $issue) => $issue->labels()->attach($bug));

    $guest = User::factory()->create();
    $workspace->members()->attach($guest->id, ['role' => WorkspaceRole::Guest]);

    foreach ([$user, $guest] as $viewer) {
        $this->actingAs($viewer)
            ->get(route('labels.index', $workspace))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('labels/index')
                ->has('labels', 2)
                ->where('labels.0', ['id' => $bug->id, 'name' => 'bug', 'color' => 'red', 'issuesCount' => 2])
                ->where('labels.1.issuesCount', 0));
    }
});

test('labels can be created, renamed, recoloured and deleted', function () {
    [$workspace, $user, $project] = workspaceWith();

    $this->actingAs($user)
        ->post(route('labels.store', $workspace), ['name' => 'bug', 'color' => 'red'])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $label = $workspace->labels()->sole();
    expect($label->color)->toBe(Color::Red);

    $this->actingAs($user)->patch(route('labels.update', [$workspace, $label]), ['name' => 'defect'])->assertSessionHasNoErrors();
    $this->actingAs($user)->patch(route('labels.update', [$workspace, $label]), ['color' => 'amber'])->assertSessionHasNoErrors();

    $label->refresh();
    expect($label->name)->toBe('defect')->and($label->color)->toBe(Color::Amber);

    $issue = Issue::factory()->create(['project_id' => $project->id]);
    $issue->labels()->attach($label);

    $this->actingAs($user)->delete(route('labels.destroy', [$workspace, $label]))->assertRedirect();

    expect(Label::query()->count())->toBe(0)->and($issue->labels()->count())->toBe(0);
});

test('label names are required and unique per workspace', function () {
    [$workspace, $user] = workspaceWith();
    $bug = Label::factory()->create(['workspace_id' => $workspace->id, 'name' => 'bug']);
    $chore = Label::factory()->create(['workspace_id' => $workspace->id, 'name' => 'chore']);
    Label::factory()->create(['name' => 'feature']);

    $this->actingAs($user)->post(route('labels.store', $workspace), ['name' => 'bug', 'color' => 'red'])->assertSessionHasErrors('name');
    $this->actingAs($user)->post(route('labels.store', $workspace), ['name' => '', 'color' => 'nope'])->assertSessionHasErrors(['name', 'color']);
    $this->actingAs($user)->post(route('labels.store', $workspace), ['name' => str_repeat('x', 51), 'color' => 'red'])->assertSessionHasErrors('name');
    $this->actingAs($user)->post(route('labels.store', $workspace), ['name' => 'feature', 'color' => 'red'])->assertSessionHasNoErrors();

    $this->actingAs($user)->patch(route('labels.update', [$workspace, $chore]), ['name' => 'bug'])->assertSessionHasErrors('name');
    // Keeping its own name is not a conflict.
    $this->actingAs($user)->patch(route('labels.update', [$workspace, $bug]), ['name' => 'bug', 'color' => 'blue'])->assertSessionHasNoErrors();
});

test('only managers can write labels', function () {
    [$workspace] = workspaceWith();
    $label = Label::factory()->create(['workspace_id' => $workspace->id]);
    $member = User::factory()->create();
    $workspace->members()->attach($member->id, ['role' => WorkspaceRole::Member]);

    $this->actingAs($member)->post(route('labels.store', $workspace), ['name' => 'new', 'color' => 'red'])->assertForbidden();
    $this->actingAs($member)->patch(route('labels.update', [$workspace, $label]), ['name' => 'renamed'])->assertForbidden();
    $this->actingAs($member)->delete(route('labels.destroy', [$workspace, $label]))->assertForbidden();
});

test('labels of another workspace are not reachable through this one', function () {
    [$workspace, $user] = workspaceWith();
    $foreign = Label::factory()->create();

    $this->actingAs($user)->patch(route('labels.update', [$workspace, $foreign]), ['name' => 'x'])->assertNotFound();
    $this->actingAs($user)->delete(route('labels.destroy', [$workspace, $foreign]))->assertNotFound();
});
