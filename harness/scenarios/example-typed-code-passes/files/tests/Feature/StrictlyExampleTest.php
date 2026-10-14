<?php

use Illuminate\Support\Facades\Artisan;

test('the Overlay is installed', function () {
    expect(config('strictly'))->toBeArray()
        ->and(Artisan::all())->toHaveKey('strictly:install');
});
