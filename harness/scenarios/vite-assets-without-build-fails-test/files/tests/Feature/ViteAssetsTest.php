<?php

test('the welcome page links the built assets', function () {
    // Asset tags come from the Vite manifest, which only a build writes.
    $this->withVite();

    $this->get(route('home'))->assertOk();
});
