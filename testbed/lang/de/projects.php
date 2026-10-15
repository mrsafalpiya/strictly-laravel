<?php

return [
    'nav' => [
        'projects' => 'Projekte',
        'cycles' => 'Zyklen',
        'labels' => 'Labels',
    ],
    'index' => [
        'title' => 'Projekte',
        'new' => 'Neues Projekt',
        'show_archived' => 'Archivierte anzeigen (:count)',
        'hide_archived' => 'Archivierte ausblenden',
        'empty' => 'Noch keine Projekte.',
    ],
    'card' => [
        'issues' => '{0} Keine Vorgänge|{1} Ein Vorgang|[2,*] :count Vorgänge',
    ],
    'create' => [
        'title' => 'Neues Projekt',
        'key_hint' => '2–10 Buchstaben, verwendet in Vorgangsnummern (:example). Er kann später nicht geändert werden.',
        'submit' => 'Projekt erstellen',
    ],
    'edit' => [
        'head' => ':key bearbeiten',
        'title' => ':name bearbeiten',
        'archived' => 'Archiviert',
        'cancel' => 'Abbrechen',
        'submit' => 'Speichern',
    ],
    'fields' => [
        'key' => 'Schlüssel',
        'name' => 'Name',
        'description' => 'Beschreibung',
        'color' => 'Farbe',
        'lead' => 'Leitung',
        'no_lead' => 'Keine Leitung',
    ],
    'flash' => [
        'created' => ':key · :name erstellt.',
        'saved' => ':key gespeichert.',
        'archived' => ':key archiviert.',
        'restored' => ':key wiederhergestellt.',
        'deleted' => ':key gelöscht.',
        'has_issues' => ':key hat noch Vorgänge. Archivieren Sie das Projekt stattdessen, oder verschieben Sie zuerst seine Vorgänge.',
    ],
];
