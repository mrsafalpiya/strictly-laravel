import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { kitDir, kitHash, kitManifest, kitTemplateRenderings } from '../src/kit-template.ts';
import { featureSubsets } from '../src/kit-variants.ts';
import { repoRoot } from '../src/paths.ts';

// Kit Conversion reports a file as already converted only if its hash is the current converted version, for some
// combination of the starter kit's auth features (KitTemplate), or one listed in `earlierConversions`. These tests read
// the manifest and the git history of kit/, so changing a converted file without recording the versions it replaces
// fails here, before apps converted by an earlier release see it as unknown content.

const manifest = kitManifest();

function git(args: string[]): string {
    return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

describe('Kit Conversion manifest', () => {
    test('lists exactly the files under kit/, each once', () => {
        const listed = Object.entries(manifest).flatMap(([path, entry]) => [path, ...(entry.adds ?? []), ...Object.values(entry.addsWith ?? {}).flat()]);

        assert.deepEqual(listed.sort(), globSync('**/*', { cwd: kitDir, withFileTypes: true })
            .filter((entry) => entry.isFile())
            .map((entry) => join(entry.parentPath, entry.name).slice(kitDir.length + 1))
            .sort());
    });

    test('every file under kit/ renders alike in the Composer package and the harness, for every combination of features', () => {
        const files = globSync('**/*', { cwd: kitDir, withFileTypes: true })
            .filter((entry) => entry.isFile())
            .map((entry) => join(entry.parentPath, entry.name).slice(kitDir.length + 1))
            .sort();
        const php = `require 'vendor/autoload.php';
$renderings = [];
foreach (json_decode($argv[1], true) as $file) {
    foreach (StrictlyLaravel\\Install\\KitTemplate::renderings(file_get_contents('packages/laravel/kit/'.$file)) as $key => $rendering) {
        $renderings[$file][$key] = hash('sha256', $rendering);
    }
}
echo json_encode($renderings);`;
        const fromPhp = JSON.parse(execFileSync('php', ['-r', php, JSON.stringify(files)], { cwd: repoRoot, encoding: 'utf8' })) as Record<string, Record<string, string>>;
        const fromHarness = Object.fromEntries(files.map((file) => [
            file,
            Object.fromEntries([...kitTemplateRenderings(readFileSync(join(kitDir, file), 'utf8'))].map(([key, rendering]) => [key, kitHash(rendering)])),
        ]));

        assert.deepEqual(fromHarness, fromPhp);
    });

    test('every feature variant of a file is keyed by features it varies with', () => {
        for (const [path, entry] of Object.entries(manifest)) {
            if (entry.variesWith === undefined) {
                assert.ok(Array.isArray(entry.upstream), `${path}: "upstream" is keyed by features, but the entry has no "variesWith"`);
                continue;
            }

            assert.ok(!Array.isArray(entry.upstream), `${path}: "variesWith" needs "upstream" keyed by features`);
            const keys = new Set(featureSubsets(entry.variesWith).map((features) => (features.length === 0 ? 'none' : features.join(','))));

            for (const key of Object.keys(entry.upstream)) {
                assert.ok(keys.has(key), `${path}: "upstream" has a key, "${key}", that is no combination of ${entry.variesWith.join(', ')}`);
            }
        }
    });

    for (const [path, entry] of Object.entries(manifest)) {
        test(`${path}: every earlier committed conversion is listed in earlierConversions`, () => {
            const repoPath = `packages/laravel/kit/${path}`;
            const renderings = (content: string) => [...kitTemplateRenderings(content).values()].map(kitHash);
            const current = new Set(renderings(readFileSync(join(kitDir, path), 'utf8')));
            const commits = git(['log', '--format=%H', '--', repoPath]).split('\n').filter((sha) => sha !== '');
            const missing = new Set<string>();

            for (const sha of commits) {
                let content: string;

                try {
                    content = git(['show', `${sha}:${repoPath}`]);
                } catch {
                    continue; // the commit deleted the file
                }

                for (const hash of renderings(content)) {
                    if (!current.has(hash) && !entry.earlierConversions.includes(hash)) {
                        missing.add(hash);
                    }
                }
            }

            assert.deepEqual([...missing], [], `add these hashes to "earlierConversions" of ${path} in kit-conversion.json`);
        });
    }
});
