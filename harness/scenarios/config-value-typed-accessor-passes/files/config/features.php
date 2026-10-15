<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Feature Flags
    |--------------------------------------------------------------------------
    |
    | Every page receives these through App\Data\SharedProps.
    |
    */

    'boards' => (bool) env('FEATURE_BOARDS', true),

    'reports' => (bool) env('FEATURE_REPORTS', false),

];
