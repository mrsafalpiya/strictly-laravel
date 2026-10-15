<?php

test('a search answers with its results', function () {
    $this->postJson('/search', ['q' => 'Launch'])
        ->assertCreated()
        ->assertJsonPath('hits', []);
});

test('a search without a query is refused with an error on its field', function () {
    $this->postJson('/search', ['q' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['q']);
});

test('the search stats count the indexed documents', function () {
    $this->getJson('/search/stats')
        ->assertOk()
        ->assertJsonPath('indexed', 42);
});

test('the search health check answers', function () {
    $this->getJson('/search/health')
        ->assertOk()
        ->assertJsonPath('status', 'ok');
});
