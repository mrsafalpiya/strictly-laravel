<?php

// The Projects area: its pages, its sidebar entries and its flash messages. English is the default locale, so these
// keys and :params type t(); lang/de/projects.php must have exactly the same ones (tests/Feature/LocaleParityTest.php).

return [
    'nav' => [
        'projects' => 'Projects',
        'cycles' => 'Cycles',
        'labels' => 'Labels',
    ],
    'index' => [
        'title' => 'Projects',
        'new' => 'New project',
        'show_archived' => 'Show archived (:count)',
        'hide_archived' => 'Hide archived',
        'empty' => 'No projects yet.',
    ],
    'card' => [
        // Pluralised: rendered with choice(), which picks the form for the count as trans_choice() does.
        'issues' => '{0} No issues|{1} One issue|[2,*] :count issues',
    ],
    'create' => [
        'title' => 'New project',
        'key_hint' => '2–10 letters, used in issue identifiers (:example). It cannot be changed later.',
        'submit' => 'Create project',
    ],
    'edit' => [
        'head' => 'Edit :key',
        'title' => 'Edit :name',
        'archived' => 'Archived',
        'cancel' => 'Cancel',
        'submit' => 'Save',
    ],
    'fields' => [
        'key' => 'Key',
        'name' => 'Name',
        'description' => 'Description',
        'color' => 'Colour',
        'lead' => 'Lead',
        'no_lead' => 'No lead',
    ],
    'flash' => [
        'created' => 'Created :key · :name.',
        'saved' => 'Saved :key.',
        'archived' => 'Archived :key.',
        'restored' => 'Restored :key.',
        'deleted' => 'Deleted :key.',
        'has_issues' => ':key still has issues. Archive it instead, or move its issues first.',
    ],
];
