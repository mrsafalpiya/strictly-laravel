<?php

use App\Enums\WorkspaceRole;
use App\Models\Attachment;
use App\Models\Issue;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Collaboration\Members;

beforeEach(fn () => Storage::fake('local'));

test('a file is uploaded to the local disk and listed on the issue', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);

    $this->actingAs($user)
        ->post(route('attachments.store', [$workspace, $project, $issue]), [
            'file' => UploadedFile::fake()->create('spec.pdf', 120, 'application/pdf'),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $attachment = Attachment::query()->sole();
    expect($attachment->original_name)->toBe('spec.pdf')
        ->and($attachment->mime_type)->toBe('application/pdf')
        ->and($attachment->size)->toBe(120 * 1024)
        ->and($attachment->disk)->toBe('local');
    Storage::disk('local')->assertExists($attachment->path);

    $this->actingAs($user)
        ->get(route('issues.show', [$workspace, $project, $issue]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('attachments', 1)
            ->where('attachments.0.name', 'spec.pdf')
            ->where('attachments.0.uploadedBy.id', $user->id));
});

test('uploads are validated: required, a file, at most 10 MB', function (mixed $file) {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);

    $this->actingAs($user)
        ->post(route('attachments.store', [$workspace, $project, $issue]), ['file' => $file])
        ->assertSessionHasErrors('file');

    expect(Attachment::query()->count())->toBe(0);
})->with([
    'missing' => fn () => null,
    'not a file' => fn () => 'hello',
    'too large' => fn () => UploadedFile::fake()->create('huge.bin', 10 * 1024 + 1),
]);

test('a file of exactly 10 MB is accepted', function () {
    [$workspace, $user, $project] = workspaceWith();
    $issue = Issue::factory()->create(['project_id' => $project->id]);

    $this->actingAs($user)
        ->post(route('attachments.store', [$workspace, $project, $issue]), ['file' => UploadedFile::fake()->create('ok.bin', 10 * 1024)])
        ->assertSessionHasNoErrors();
});

test('guests cannot upload', function () {
    [$workspace, , $project] = workspaceWith();
    $guest = Members::add($workspace, WorkspaceRole::Guest);
    $issue = Issue::factory()->create(['project_id' => $project->id]);

    $this->actingAs($guest)
        ->post(route('attachments.store', [$workspace, $project, $issue]), ['file' => UploadedFile::fake()->create('a.txt', 1)])
        ->assertForbidden();
});

test('members (guests included) can download, outsiders and other issues cannot', function () {
    [$workspace, $user, $project] = workspaceWith();
    $guest = Members::add($workspace, WorkspaceRole::Guest);
    $issue = Issue::factory()->create(['project_id' => $project->id]);
    $otherIssue = Issue::factory()->create(['project_id' => $project->id]);
    $this->actingAs($user)->post(route('attachments.store', [$workspace, $project, $issue]), [
        'file' => UploadedFile::fake()->createWithContent('notes.txt', 'hello world'),
    ]);
    $attachment = Attachment::query()->sole();

    $this->actingAs($guest)
        ->get(route('attachments.show', [$workspace, $project, $issue, $attachment]))
        ->assertOk()
        ->assertDownload('notes.txt');

    $this->actingAs($user)
        ->get(route('attachments.show', [$workspace, $project, $otherIssue, $attachment]))
        ->assertNotFound();

    [$foreignWorkspace, $outsider] = workspaceWith();
    $this->actingAs($outsider)
        ->get(route('attachments.show', [$workspace, $project, $issue, $attachment]))
        ->assertNotFound();
    $this->actingAs($outsider)
        ->get("/w/{$foreignWorkspace->slug}/projects/{$project->key}/issues/{$issue->number}/attachments/{$attachment->id}")
        ->assertNotFound();
});

test('attachments can be deleted by the uploader or a manager only', function () {
    [$workspace, $owner, $project] = workspaceWith();
    $uploader = Members::add($workspace);
    $member = Members::add($workspace);
    $issue = Issue::factory()->create(['project_id' => $project->id]);

    foreach (['a.txt', 'b.txt'] as $name) {
        $this->actingAs($uploader)->post(route('attachments.store', [$workspace, $project, $issue]), ['file' => UploadedFile::fake()->create($name, 1)]);
    }
    [$first, $second] = Attachment::query()->orderBy('id')->get()->all();

    $this->actingAs($member)->delete(route('attachments.destroy', [$workspace, $project, $issue, $first]))->assertForbidden();
    $this->actingAs($uploader)->delete(route('attachments.destroy', [$workspace, $project, $issue, $first]))->assertRedirect();
    $this->actingAs($owner)->delete(route('attachments.destroy', [$workspace, $project, $issue, $second]))->assertRedirect();

    expect(Attachment::query()->count())->toBe(0);
    Storage::disk('local')->assertMissing($first->path);
    Storage::disk('local')->assertMissing($second->path);
});
