<?php

use App\Data\ProjectData;

test('project data serialises the props its generated type declares', function () {
    expect(new ProjectData(name: 'Tracklane', openIssues: 3)->toArray())
        ->toBe(['name' => 'Tracklane', 'openIssues' => 3]);
});
