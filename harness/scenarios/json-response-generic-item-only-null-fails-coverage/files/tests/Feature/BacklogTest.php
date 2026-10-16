<?php

test('the backlog page renders', function () {
    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('/backlog')->assertOk();
});

test('the backlog lists its issues', function () {
    $this->getJson('/backlog/issues')
        ->assertOk()
        ->assertJsonPath('items.0.title', 'Launch')
        ->assertJsonPath('items.0.assignee', null);
});
