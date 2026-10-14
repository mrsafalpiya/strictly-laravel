import { join } from 'node:path';

/** Monorepo root (this file lives in harness/src). */
export const repoRoot = join(import.meta.dirname, '..', '..');

/** The Overlay's Composer package. */
export const composerPackageDir = join(repoRoot, 'packages', 'laravel');

/** The Overlay's npm package. */
export const npmPackageDir = join(repoRoot, 'packages', 'npm');

/** Gitignored home of every disposable fixture app. All apps sit at the same depth so relative symlinks survive copies. */
export const fixturesDir = join(repoRoot, '.fixtures');

export const scenariosDir = join(repoRoot, 'harness', 'scenarios');
