<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Feature Flags
    |--------------------------------------------------------------------------
    |
    | Areas of Tracklane a deployment can turn off. A feature that is off has
    | no routes (EnsureFeatureEnabled) and no sidebar entry: every page gets
    | these flags through App\Data\SharedProps, typed as FeaturesData.
    |
    */

    'features' => [
        'cycles' => (bool) env('TRACKLANE_CYCLES', true),
        'labels' => (bool) env('TRACKLANE_LABELS', true),
    ],

];
