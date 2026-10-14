import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { failureReport, githubAnnotations } from '../src/failure-report.ts';

describe('GitHub Actions annotations for a failure report', () => {
    // Escaping follows @actions/core: % CR LF in the message, and also : , in properties such as the title.
    test('one error per diagnostic, titled with the stage', () => {
        const report = failureReport('ci:check:tsc', "resources/js/a.ts(1,7): error TS2322: 50% of 'x'\n");

        assert.deepEqual(githubAnnotations(report, ''), [
            "::error title=Fresh install failed at ci%3Acheck%3Atsc::resources/js/a.ts:1: error TS2322: 50%25 of 'x'",
        ]);
    });

    test('at most 10, the limit GitHub shows per step, the last one counting the rest', () => {
        const output = Array.from({ length: 12 }, (_, i) => `resources/js/a.ts(${i + 1},1): error TS2322: x\n`).join('');
        const annotations = githubAnnotations(failureReport('ci:check:tsc', output), output);

        assert.equal(annotations.length, 10);
        assert.equal(annotations[8], '::error title=Fresh install failed at ci%3Acheck%3Atsc::resources/js/a.ts:9: error TS2322: x');
        assert.equal(annotations[9], '::error title=Fresh install failed at ci%3Acheck%3Atsc::…and 3 more; see the job log');
    });

    test('the tail of the output when no file is named', () => {
        const report = failureReport('strictly:install', 'RuntimeException\n\n  Unable to detect application namespace.\n');

        assert.deepEqual(githubAnnotations(report, 'RuntimeException\n\n  Unable to detect application namespace.\n'), [
            '::error title=Fresh install failed at strictly%3Ainstall::RuntimeException%0A%0A  Unable to detect application namespace.',
        ]);
    });
});

// The outputs below are what each tool really prints in a fixture app (ANSI codes stripped, as the harness does).
describe('a failed fresh-install stage names the stage and the files that broke', () => {
    test('tsc', () => {
        const output = `$ tsc --noEmit
resources/js/lib/broken.ts(1,7): error TS2322: Type 'string' is not assignable to type 'number'.
[ELIFECYCLE] Command failed with exit code 2.
Script pnpm run types:check handling the ci:check:tsc event returned with error code 2
`;

        assert.deepEqual(failureReport('ci:check:tsc', output), {
            stage: 'ci:check:tsc',
            diagnostics: [
                { file: 'resources/js/lib/broken.ts', line: 1, message: "error TS2322: Type 'string' is not assignable to type 'number'." },
            ],
        });
    });

    test('oxlint', () => {
        const output = `$ vp check
pass: All 71 files are correctly formatted (1292ms, 20 threads)
! eslint(no-debugger): \`debugger\` statement is not allowed
   ,-[resources/js/lib/broken.ts:3:1]
 2 | export default x;
 3 | debugger;
   : ^^^^^^^^^
   \`----
  help: Remove the debugger statement

Found 0 errors and 1 warning in 65 files (790ms, 20 threads)
warn: Lint warnings found
[ELIFECYCLE] Command failed with exit code 1.
`;

        assert.deepEqual(failureReport('ci:check:lint', output).diagnostics, [
            { file: 'resources/js/lib/broken.ts', line: 3, message: 'eslint(no-debugger): `debugger` statement is not allowed' },
        ]);
    });

    test('oxfmt', () => {
        const output = `$ vp check
resources/js/lib/broken.ts (0ms)
resources/js/pages/welcome.tsx (1ms)

Found formatting issues in 2 files (1534ms, 20 threads). Run \`vp check --fix\` to fix them.
error: Formatting issues found
[ELIFECYCLE] Command failed with exit code 1.
`;

        assert.deepEqual(failureReport('ci:check:lint', output).diagnostics, [
            { file: 'resources/js/lib/broken.ts', message: 'formatting issues (oxfmt)' },
            { file: 'resources/js/pages/welcome.tsx', message: 'formatting issues (oxfmt)' },
        ]);
    });

    test('strictly:install: a hook that failed', () => {
        const output = ` config/strictly.php .. unchanged
 Composer scripts: ci:check and its steps (using pnpm) .. applied
 Wayfinder QUERY verb workaround .. not applied

 ERROR file_put_contents(resources/js/wayfinder/index.ts): Failed to open stream: Permission denied.
`;

        assert.deepEqual(failureReport('strictly:install', output).diagnostics, [
            {
                message:
                    'Wayfinder QUERY verb workaround: not applied: file_put_contents(resources/js/wayfinder/index.ts): Failed to open stream: Permission denied.',
            },
        ]);
    });

    test('strictly:install: files Kit Conversion left alone', () => {
        const output = `  config/strictly.php .............................................. unchanged
  Composer scripts: ci:check and its steps (using pnpm) .............. applied
  Wayfinder QUERY verb workaround .................................. unchanged
  phpstan.neon ..................................... skipped (unknown content)
  app/Actions/Fortify/CreateNewUser.php .............................. applied
  routes/web.php ................................... skipped (unknown content)
  tests/Unit/ExampleTest.php ......................................... applied

   WARN  Kit Conversion left these files untouched because their content is not a known Base Kit version: phpstan.neon (sha256 57266ec8a9eb608da3e0536471941228ef9ccfbc9c021df5fa04951cd08fecbb), routes/web.php (sha256 0b2305903b6f54e9656c0fccff2c175582b155dcbf4c2484a7907d2237efe627). Compare each with its converted version in vendor/mrsafalpiya/strictly-laravel/kit/ and apply the changes by hand.
`;

        assert.deepEqual(failureReport('strictly:install', output).diagnostics, [
            { file: 'phpstan.neon', message: 'skipped (unknown content)' },
            { file: 'routes/web.php', message: 'skipped (unknown content)' },
        ]);
    });

    test('ci:check:install: hooks strictly:install would still apply', () => {
        const output = `  config/strictly.php .............................................. unchanged
  Composer scripts: ci:check and its steps (using pnpm) ............ unchanged
  tsconfig.json: strictness flags .................................... missing
  vite.config.ts: Strictly Laravel Vite plugin ................. not applied

   ERROR  vite.config.ts has no \`plugins: [\` array written over several lines; add it by hand.

  routes/web.php ............................................... not converted
  PHPStan extension included in phpstan.neon ....................... unchanged

   ERROR  Strictly Laravel is not fully applied to this app: tsconfig.json: strictness flags (missing). Run \`php artisan strictly:install\`.

Script @php artisan strictly:install --check handling the ci:check:install event returned with error code 1
`;

        assert.deepEqual(failureReport('ci:check:install', output).diagnostics, [
            { message: 'tsconfig.json: strictness flags: missing' },
            { message: 'vite.config.ts: Strictly Laravel Vite plugin: not applied: vite.config.ts has no `plugins: [` array written over several lines; add it by hand.' },
            { file: 'routes/web.php', message: 'not converted' },
        ]);
    });

    test('Pint', () => {
        const output = `
  ................⨯.........⨯...............................

  ──────────────────────────────────────────────────────────────────── Laravel
    FAIL   .......................................... 58 files, 2 style issues
  ⨯ app/Broken.php        single_quote, braces_position, statement_indentation
  ⨯ tests/Feature/BrokenTest.php                                  single_quote

Script pint --parallel --test handling the lint:check event returned with error code 1
`;

        assert.deepEqual(failureReport('ci:check:test', output).diagnostics, [
            { file: 'app/Broken.php', message: 'Pint: single_quote, braces_position, statement_indentation' },
            { file: 'tests/Feature/BrokenTest.php', message: 'Pint: single_quote' },
        ]);
    });

    test('PHPStan', () => {
        const output = `Note: Using configuration file /tmp/app/phpstan.neon.

 ------ -------------------------------------------------------------
  Line   app/Broken.php
 ------ -------------------------------------------------------------
  7      Function App\\broken() should return int but returns string.
         🪪  return.type
  9      Function App\\other() has no return type specified.
         🪪  missingType.return
 ------ -------------------------------------------------------------

 ------ -------------------------------------------------------------
  Line   app/Models/User.php
 ------ -------------------------------------------------------------
  12     Access to an undefined property App\\Models\\User::$avatar.
 ------ -------------------------------------------------------------

 [ERROR] Found 3 errors

Script phpstan analyse handling the types:check event returned with error code 1
`;

        assert.deepEqual(failureReport('ci:check:test', output).diagnostics, [
            { file: 'app/Broken.php', line: 7, message: 'Function App\\broken() should return int but returns string.' },
            { file: 'app/Broken.php', line: 9, message: 'Function App\\other() has no return type specified.' },
            { file: 'app/Models/User.php', line: 12, message: 'Access to an undefined property App\\Models\\User::$avatar.' },
        ]);
    });

    test('Pest', () => {
        const output = `
  PASS  Tests\\Feature\\Settings\\SecurityTest
  ✓ password can be updated                                             0.02s
  ────────────────────────────────────────────────────────────────────────────
   FAILED  Tests\\Feature\\BrokenTest > broken
  Failed asserting that 1 is identical to 2.

  at tests/Feature/BrokenTest.php:4
      1▕ <?php
      2▕
      3▕ test('broken', function () {
  ➜   4▕     expect(1)->toBe(2);
      5▕ });
      6▕

  1   tests/Feature/BrokenTest.php:4


  Tests:    1 failed, 40 passed (139 assertions)
`;

        assert.deepEqual(failureReport('ci:check:test', output).diagnostics, [
            { file: 'tests/Feature/BrokenTest.php', line: 4, message: 'Tests\\Feature\\BrokenTest > broken: Failed asserting that 1 is identical to 2.' },
        ]);
    });
});
