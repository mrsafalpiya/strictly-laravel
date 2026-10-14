// `pnpm test [<pattern>...]`: run the harness test suite, or only the tests whose names match a pattern
// (e.g. a scenario name). Plain `node --test <glob>` can't take the patterns pnpm appends after the glob.
import { globSync } from 'node:fs';
import { join } from 'node:path';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';

import { repoRoot } from './paths.ts';

const patterns = process.argv.slice(2);
// The npm package's own tests sit next to it, so its dependencies (react, react-dom) resolve to its copies.
const files = globSync(['harness/tests/**/*.test.ts', 'packages/npm/tests/**/*.test.ts'], { cwd: repoRoot }).map((file) =>
    join(repoRoot, file),
);

run({ files, ...(patterns.length > 0 ? { testNamePatterns: patterns } : {}) })
    .on('test:fail', () => {
        process.exitCode = 1;
    })
    .compose(spec)
    .pipe(process.stdout);
