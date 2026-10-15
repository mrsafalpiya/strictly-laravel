<?php

test('the recent projects answer as one Data object holding the list', function () {
    $this->getJson('/projects/recent')
        ->assertOk()
        ->assertJsonPath('projects.0.name', 'Launch')
        ->assertJsonCount(2, 'projects');
});
