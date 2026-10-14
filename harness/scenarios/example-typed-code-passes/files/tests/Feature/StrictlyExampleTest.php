<?php

test('the strictly config is registered', function () {
    expect(config('strictly'))->toBeArray();
});
