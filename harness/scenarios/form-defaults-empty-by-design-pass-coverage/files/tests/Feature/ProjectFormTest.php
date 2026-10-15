<?php

use App\Data\StoreProjectData;
use App\Pages\Projects\CreatePage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::get('projects/create', fn (): CreatePage => new CreatePage(
        defaults: new StoreProjectData(name: '', description: null),
    ));
    Route::post('projects', fn (StoreProjectData $data): RedirectResponse => redirect('projects/create'));
});

test('the create form starts empty', function () {
    $this->get('projects/create')->assertOk();
});

test('a project can be created with a description', function () {
    $this->post('projects', ['name' => 'Tracklane', 'description' => 'An issue tracker'])
        ->assertRedirect('projects/create');
});
