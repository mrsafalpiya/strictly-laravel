<?php

use App\Data\LabelData;
use App\Pages\Labels\IndexPage;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

test('the labels page lists the labels that are not archived, as a list', function () {
    Route::get('labels', fn (): IndexPage => new IndexPage(
        labels: collect([new LabelData('Bug'), new LabelData('Archived'), new LabelData('Docs')])
            ->filter(fn (LabelData $label): bool => $label->name !== 'Archived')
            ->values()
            ->all(),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('labels')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('labels', [['name' => 'Bug'], ['name' => 'Docs']]));
});
