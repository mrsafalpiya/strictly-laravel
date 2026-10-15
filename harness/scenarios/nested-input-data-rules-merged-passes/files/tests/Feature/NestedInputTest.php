<?php

use App\Data\StoreTaskData;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::post('/tasks', fn (StoreTaskData $task): Response => response()->noContent());
});

test('a nested input matching its type is accepted', function () {
    $this->postJson('/tasks', ['task' => ['title' => 'Ship it'], 'subtasks' => [['title' => 'Write it']]])
        ->assertNoContent();
});

test('a nested input keeps its inferred rules next to its own', function () {
    $this->postJson('/tasks', ['task' => ['title' => null], 'subtasks' => [['title' => 'Write it']]])
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['task.title']);

    $this->postJson('/tasks', ['task' => ['title' => 42], 'subtasks' => [['title' => 'Write it']]])
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['task.title']);

    $this->postJson('/tasks', ['task' => ['title' => str_repeat('x', 51)], 'subtasks' => [['title' => 'Write it']]])
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['task.title']);
});

test('a nested input in a list keeps its inferred rules next to its own', function () {
    $this->postJson('/tasks', ['task' => ['title' => 'Ship it'], 'subtasks' => [['title' => 'Write it'], ['title' => null]]])
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['subtasks.1.title']);
});
