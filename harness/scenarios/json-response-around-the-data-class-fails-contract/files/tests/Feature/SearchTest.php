<?php

use Illuminate\Support\Facades\Cache;

test('a search answers with its results', function () {
    $this->postJson('/search', ['q' => 'Launch'])
        ->assertCreated()
        ->assertJsonPath('hits.0.title', 'Launch plan');
});

test('a search without a query is refused with an error on its field', function () {
    $this->postJson('/search', ['q' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['q']);
});

test('the search stats count the indexed documents', function () {
    Cache::put('search.counts', ['documents' => 40, 'users' => 2]);

    $this->getJson('/search/stats')
        ->assertOk()
        ->assertJsonPath('indexed', 42);
});

test('the search health check answers', function () {
    $this->getJson('/search/health')
        ->assertOk()
        ->assertJsonPath('status', 'ok');
});
