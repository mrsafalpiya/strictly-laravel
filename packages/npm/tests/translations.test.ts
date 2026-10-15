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
