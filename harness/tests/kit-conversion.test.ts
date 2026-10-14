import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { composerPackageDir, repoRoot } from '../src/paths.ts';

// Kit Conversion reports a file as already converted only if its hash is the current converted version or one listed in
// `earlierConversions`. These tests read the manifest and the git history of kit/, so changing a converted file without
// recording the version it replaces fails here, before apps converted by an earlier release see it as unknown content.

interface ManifestEntry {
    upstream: string[];
    earlierConversions: string[];
    /** Files the conversion adds, written only together with it, so they never need earlier versions recorded. */
    adds?: string[];
}

const kitDir = join(composerPackageDir, 'kit');
const manifest = JSON.parse(readFileSync(join(composerPackageDir, 'kit-conversion.json'), 'utf8')) as Record<string, ManifestEntry>;

/** The hash Kit Conversion compares: SHA-256 with "\r\n" line endings normalised to "\n". */
function kitHash(content: string): string {
    return createHash('sha256').update(content.replaceAll('\r\n', '\n')).digest('hex');
}

function git(args: string[]): string {
    return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

describe('Kit Conversion manifest', () => {
    test('lists exactly the files under kit/, each once', () => {
        const listed = Object.entries(manifest).flatMap(([path, entry]) => [path, ...(entry.adds ?? [])]);

        assert.deepEqual(listed.sort(), globSync('**/*', { cwd: kitDir, withFileTypes: true })
            .filter((entry) => entry.isFile())
            .map((entry) => join(entry.parentPath, entry.name).slice(kitDir.length + 1))
            .sort());
    });

    for (const [path, entry] of Object.entries(manifest)) {
        test(`${path}: every earlier committed conversion is listed in earlierConversions`, () => {
            const repoPath = `packages/laravel/kit/${path}`;
            const current = kitHash(readFileSync(join(kitDir, path), 'utf8'));
            const commits = git(['log', '--format=%H', '--', repoPath]).split('\n').filter((sha) => sha !== '');
            const missing = new Set<string>();

            for (const sha of commits) {
                let content: string;

                try {
                    content = git(['show', `${sha}:${repoPath}`]);
                } catch {
                    continue; // the commit deleted the file
                }

                const hash = kitHash(content);

                if (hash !== current && !entry.earlierConversions.includes(hash)) {
                    missing.add(hash);
                }
            }

            assert.deepEqual([...missing], [], `add these hashes to "earlierConversions" of ${path} in kit-conversion.json`);
        });
    }
});
