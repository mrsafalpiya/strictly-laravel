<?php

use App\Data\Issues\IssueFiltersData;
use App\Enums\IssueSort;
use App\Enums\WorkspaceRole;
use App\Models\Label;
use App\Models\SavedView;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Collaboration\Members;

test('the current filters can be saved as a personal view', function () {
    [$workspace, $user, $project] = workspaceWith(WorkspaceRole::Guest);
    $label = Label::factory()->create(['workspace_id' => $workspace->id]);

    // Exactly what issues/index.tsx posts: the `filters` prop as a nested JSON object.
    $this->actingAs($user)
        ->postJson(route('views.store', $workspace), [
            'name' => 'My urgent bugs',
            'filters' => [
                'search' => 'crash',
                'statuses' => ['todo', 'in_progress'],
                'priorities' => [4],
                'labelIds' => [$label->id],
                'assigneeId' => $user->id,
                'projectKey' => $project->key,
                'sort' => 'priority',
                'includeClosed' => false,
            ],
        ])
        ->assertRedirect();

    $view = SavedView::query()->sole();
    expect($view->name)->toBe('My urgent bugs')
        ->and($view->user_id)->toBe($user->id)
        ->and($view->filters->sort)->toBe(IssueSort::Priority)
        // Compared serialised: with laravel-data's `cast_and_transform_iterables` feature off (the default),
        // `list<IssueStatus>` items stay plain strings despite the PHPDoc type.
        ->and($view->filters->toArray())->toMatchArray(['statuses' => ['todo', 'in_progress'], 'priorities' => [4]]);

    $this->actingAs($user)
        ->get(route('issues.index', $workspace))
        ->assertInertia(fn (Assert $page) => $page
            ->has('savedViews', 1)
            ->where('savedViews.0.name', 'My urgent bugs')
            ->where('savedViews.0.filters.statuses', ['todo', 'in_progress'])
            ->where('savedViews.0.filters.priorities', [4]));
});

test('default filters (empty lists) can be saved', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->postJson(route('views.store', $workspace), [
            'name' => 'Everything',
            'filters' => [
                'search' => null,
                'statuses' => [],
                'priorities' => [],
                'labelIds' => [],
                'assigneeId' => null,
                'projectKey' => null,
                'sort' => 'newest',
                'includeClosed' => true,
            ],
        ])
        ->assertRedirect();

    expect(SavedView::query()->sole()->filters->includeClosed)->toBeTrue();
});

test('saved views are validated, including the nested filters', function () {
    [$workspace, $user] = workspaceWith();

    $this->actingAs($user)
        ->postJson(route('views.store', $workspace), [
            'name' => '',
            'filters' => ['statuses' => ['bogus'], 'sort' => 'sideways', 'search' => str_repeat('a', 101)],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'filters.statuses.0', 'filters.priorities', 'filters.labelIds', 'filters.sort', 'filters.search']);

    expect(SavedView::query()->count())->toBe(0);
});

test('only the owner can delete a saved view', function () {
    [$workspace, $owner] = workspaceWith();
    $member = Members::add($workspace);
    $this->actingAs($member)->post(route('views.store', $workspace), ['name' => 'Mine', 'filters' => (new IssueFiltersData)->toArray()]);
    $view = SavedView::query()->sole();

    $this->actingAs($owner)->delete(route('views.destroy', [$workspace, $view]))->assertForbidden();
    $this->actingAs($member)->delete(route('views.destroy', [$workspace, $view]))->assertRedirect();

    expect(SavedView::query()->count())->toBe(0);
});

test('views of another workspace are not reachable through this one', function () {
    [$workspace, $user] = workspaceWith();
    [$otherWorkspace, $otherUser] = workspaceWith();
    $view = SavedView::query()->create(['workspace_id' => $otherWorkspace->id, 'user_id' => $otherUser->id, 'name' => 'x', 'filters' => new IssueFiltersData]);

    $this->actingAs($user)->delete(route('views.destroy', [$workspace, $view]))->assertNotFound();
});
