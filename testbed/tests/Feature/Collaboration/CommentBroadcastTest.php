<?php

use App\Events\CommentPosted;
use App\Models\Issue;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Event;
use Illuminate\Testing\TestResponse;

test('a posted comment is broadcast to the workspace, so open issue pages reload their thread', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    /** @var Collection<int, CommentPosted> $broadcast */
    $broadcast = new Collection;
    Event::listen(CommentPosted::class, fn (CommentPosted $event) => $broadcast->push($event));

    $this->actingAs($user)
        ->post(route('comments.store', [$workspace, $project, $issue]), ['body' => 'On it, shipping today'])
        ->assertRedirect();

    // The broadcast itself is recorded as a Contract, checked against CommentPostedData's type.
    $event = $broadcast->sole();
    $payload = $event->broadcastData();
    expect($event->broadcastOn()->name)->toBe("private-workspaces.{$workspace->slug}")
        ->and($payload->issueId)->toBe($issue->id)
        ->and($payload->issue->identifier)->toBe('TRK-1')
        ->and($payload->author->id)->toBe($user->id)
        ->and($payload->excerpt)->toBe('On it, shipping today');
});

test('only the workspace members may listen to its channel', function () {
    [$workspace, $member] = workspaceWith();
    $outsider = User::factory()->create();

    // The tests broadcast to the null connection, which authorizes anyone: authorize the way Reverb does instead,
    // with its Pusher-protocol broadcaster and the app's routes/channels.php.
    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb.key' => 'tracklane-key',
        'broadcasting.connections.reverb.secret' => 'tracklane-secret',
        'broadcasting.connections.reverb.app_id' => 'tracklane',
    ]);
    Broadcast::forgetDrivers();
    require base_path('routes/channels.php');

    $subscribe = fn (User $user): TestResponse => $this->actingAs($user)->post('/broadcasting/auth', [
        'socket_id' => '1234.5678',
        'channel_name' => "private-workspaces.{$workspace->slug}",
    ]);

    $subscribe($member)->assertOk()->assertJsonStructure(['auth']);
    $subscribe($outsider)->assertForbidden();
});
