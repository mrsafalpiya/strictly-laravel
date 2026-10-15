<?php

use App\Events\ProjectUpdated;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Event;

test('updating a project broadcasts it to the project channel', function () {
    $owner = User::factory()->create();
    $project = Project::query()->create(['user_id' => $owner->id, 'name' => 'Launch', 'description' => null]);
    $broadcast = collect();
    Event::listen(ProjectUpdated::class, fn (ProjectUpdated $event) => $broadcast->push($event));

    $this->actingAs($owner)
        ->patch(route('projects.update', $project), ['name' => 'Launch', 'description' => 'The first release'])
        ->assertSessionHasNoErrors();

    $this->actingAs($owner)
        ->patch(route('projects.update', $project), ['name' => 'Launch v2', 'description' => null])
        ->assertSessionHasNoErrors();

    expect($broadcast)->toHaveCount(2);
});

test('only the owner can update a project', function () {
    $project = Project::query()->create(['user_id' => User::factory()->create()->id, 'name' => 'Launch', 'description' => null]);

    $this->actingAs(User::factory()->create())
        ->patch(route('projects.update', $project), ['name' => 'Taken over', 'description' => null])
        ->assertForbidden();
});
