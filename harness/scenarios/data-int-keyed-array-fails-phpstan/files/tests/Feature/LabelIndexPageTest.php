<?php

use App\Data\LabelData;
use App\Pages\Labels\IndexPage;
use Illuminate\Support\Facades\Route;

test('the labels page lists the labels that are not archived', function () {
    Route::get('labels', fn (): IndexPage => new IndexPage(
        labels: collect([new LabelData('Bug'), new LabelData('Archived'), new LabelData('Docs')])
            ->filter(fn (LabelData $label): bool => $label->name !== 'Archived')
            ->all(),
    ));

    // The page isn't in the app's Vite build.
    $this->withoutVite();

    $this->get('labels')->assertOk();
});
