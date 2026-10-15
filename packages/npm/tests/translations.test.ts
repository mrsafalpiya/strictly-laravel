import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { createTranslator } from '../translations/index.js';

// t() at runtime, bound the way @/generated/translations binds it: the default locale and each locale's messages by
// the path of its generated JSON file. The harness scenarios prove its types in an app (translation-*-fails-tsc).

type Keys = {
    'auth.throttle': 'seconds';
    'inbox.greeting': 'name';
    'inbox.shout': 'name';
    'Log in': never;
    'only.english': never;
    'meeting.at': never;
};

const messages = () => ({
    './lang/en.json': {
        'auth.throttle': 'Too many login attempts. Please try again in :seconds seconds.',
        'inbox.greeting': 'Welcome back, :Name! (:name)',
        'inbox.shout': 'HEY :NAME',
        'Log in': 'Log in',
        'only.english': 'Only in English',
        'meeting.at': 'The meeting is at 10:30, :unfilled.',
    },
    './lang/de.json': {
        'auth.throttle': 'Zu viele Loginversuche. Versuchen Sie es bitte in :seconds Sekunden nochmal.',
        'inbox.greeting': 'Willkommen zurück, :Name!',
        'inbox.shout': 'HALLO :NAME',
        'Log in': 'Anmelden',
    },
});

describe('t()', () => {
    test('translates into the default locale and fills the params, as Laravel does', () => {
        const { t, locale } = createTranslator<Keys, 'en' | 'de'>('en', messages());

        assert.equal(locale(), 'en');
        assert.equal(t('Log in'), 'Log in');
        assert.equal(t('auth.throttle', { seconds: 5 }), 'Too many login attempts. Please try again in 5 seconds.');
        assert.equal(t('inbox.greeting', { name: 'ada' }), 'Welcome back, Ada! (ada)');
        assert.equal(t('inbox.shout', { name: 'ada' }), 'HEY ADA');
    });

    test('leaves a placeholder no param fills as it is', () => {
        const { t } = createTranslator<Keys, 'en' | 'de'>('en', messages());

        assert.equal(t('meeting.at'), 'The meeting is at 10:30, :unfilled.');
    });

    test('translates into the locale set, falling back to the default locale for a key it lacks', () => {
        const { t, locale, setLocale } = createTranslator<Keys, 'en' | 'de'>('en', messages());

        setLocale('de');

        assert.equal(locale(), 'de');
        assert.equal(t('Log in'), 'Anmelden');
        assert.equal(t('auth.throttle', { seconds: 30 }), 'Zu viele Loginversuche. Versuchen Sie es bitte in 30 Sekunden nochmal.');
        assert.equal(t('only.english'), 'Only in English');
    });

    test('returns the key when no locale has it, even when it names an Object property', () => {
        const { t } = createTranslator<Record<string, never>, 'en'>('en', messages());

        assert.equal(t('missing.key'), 'missing.key');
        assert.equal(t('constructor'), 'constructor');
        assert.equal(t('toString'), 'toString');
    });
});

// choice() at runtime. Every expected string is what Laravel's trans_choice() (Illuminate\Translation\Translator::choice
// and MessageSelector) returns for the same message, count and locale.

type PluralKeys = {
    'issues.count': 'count';
    'issues.assigned': 'count' | 'name';
    signed: never;
    span: never;
    apples: never;
    two: never;
    unmatched: never;
    padded: never;
    'only.english': never;
};

type PluralKey = keyof PluralKeys;

const pluralMessages = () => ({
    './lang/en.json': {
        'issues.count': '{0} No issues|{1} One issue|[2,*] :count issues',
        'issues.assigned': ':count issue assigned to :name|:count issues assigned to :name',
        signed: '[*,-1] Negative|{0} Zero|[1,*] Positive',
        span: '{1} One|[2,5] A few|[6,*] Many',
        apples: 'apple|apples',
        two: 'a|b',
        unmatched: '{0} none|[1,5] few',
        padded: '{1}  One issue  |[2,*] Many',
        'only.english': 'apple|apples',
    },
    './lang/de.json': {
        'issues.count': '{0} Keine Issues|{1} Ein Issue|[2,*] :count Issues',
        apples: 'Apfel|Äpfel',
    },
    './lang/fr.json': { apples: 'pomme|pommes' },
    './lang/ru.json': { apples: 'яблоко|яблока|яблок', two: 'a|b' },
    './lang/pl.json': { apples: 'jabłko|jabłka|jabłek' },
    './lang/ar.json': { apples: 'zero|one|two|few|many|other' },
    './lang/ja.json': { apples: 'りんご|りんごs' },
});

type PluralLocale = 'en' | 'de' | 'fr' | 'ru' | 'pl' | 'ar' | 'ja';

function choiceIn(locale: PluralLocale) {
    const translator = createTranslator<PluralKeys, PluralLocale, PluralKey>('en', pluralMessages());
    translator.setLocale(locale);

    return translator.choice;
}

describe('choice()', () => {
    test('picks the form whose {n} or [from,to] range holds the count, * leaving a range open, and trims it', () => {
        const choice = choiceIn('en');

        assert.deepEqual(
            [0, 1, 2, 10].map((count) => choice('issues.count', count)),
            ['No issues', 'One issue', '2 issues', '10 issues'],
        );
        assert.deepEqual(
            [-5, 0, 3].map((count) => choice('signed', count)),
            ['Negative', 'Zero', 'Positive'],
        );
        assert.deepEqual(
            [1, 4, 6].map((count) => choice('span', count)),
            ['One', 'A few', 'Many'],
        );
        assert.equal(choice('padded', 1), 'One issue');
    });

    test('picks a plain form by the locale\'s plural rule, as Laravel does', () => {
        assert.deepEqual(
            [0, 1, 2, 1.5, -1].map((count) => choiceIn('en')('apples', count)),
            ['apples', 'apple', 'apples', 'apples', 'apple'],
        );
        assert.deepEqual(
            [0, 1, 2].map((count) => choiceIn('de')('apples', count)),
            ['Äpfel', 'Apfel', 'Äpfel'],
        );
        assert.deepEqual(
            [0, 1, 2].map((count) => choiceIn('fr')('apples', count)),
            ['pomme', 'pomme', 'pommes'],
        );
        assert.deepEqual(
            [1, 2, 5, 11, 21, 22, 111].map((count) => choiceIn('ru')('apples', count)),
            ['яблоко', 'яблока', 'яблок', 'яблок', 'яблоко', 'яблока', 'яблок'],
        );
        assert.deepEqual(
            [1, 2, 5, 12, 22].map((count) => choiceIn('pl')('apples', count)),
            ['jabłko', 'jabłka', 'jabłek', 'jabłek', 'jabłka'],
        );
        assert.deepEqual(
            [0, 1, 2, 3, 11, 100].map((count) => choiceIn('ar')('apples', count)),
            ['zero', 'one', 'two', 'few', 'many', 'other'],
        );
        assert.deepEqual(
            [1, 5].map((count) => choiceIn('ja')('apples', count)),
            ['りんご', 'りんご'],
        );
    });

    test('takes the first form when the message lacks the one the rule picks, and strips the ranges no count matched', () => {
        assert.equal(choiceIn('ru')('two', 5), 'a');
        assert.equal(choiceIn('en')('unmatched', 10), ' few');
    });

    test('fills :count with the count unless a count param replaces it, and the other params', () => {
        const choice = choiceIn('en');

        assert.equal(choice('issues.assigned', 1, { name: 'Ada' }), '1 issue assigned to Ada');
        assert.equal(choice('issues.assigned', 3, { name: 'Ada' }), '3 issues assigned to Ada');
        assert.equal(choice('issues.count', 1000, { count: '1,000' }), '1,000 issues');
    });

    test('translates into the locale set, falling back to the default locale\'s message and plural rule', () => {
        assert.deepEqual(
            [0, 1, 7].map((count) => choiceIn('de')('issues.count', count)),
            ['Keine Issues', 'Ein Issue', '7 Issues'],
        );
        assert.equal(choiceIn('ru')('only.english', 5), 'apples');
    });

    test('returns the key when no locale has it', () => {
        const { choice } = createTranslator<Record<string, never>, 'en', string>('en', pluralMessages());

        assert.equal(choice('missing.key', 2), 'missing.key');
    });
});
