import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readPackageVersions } from '../src/versions.ts';

test('the Composer and npm packages share one version number', () => {
    const { composer, npm } = readPackageVersions();

    assert.match(composer, /^\d+\.\d+\.\d+(-[\w.]+)?$/, 'composer.json needs a semver "version"');
    assert.equal(npm, composer, 'packages/npm/package.json and packages/laravel/composer.json versions differ');
});
