import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { composerPackageDir, npmPackageDir } from './paths.ts';

function readVersion(manifest: string): string {
    const parsed: unknown = JSON.parse(readFileSync(manifest, 'utf8'));
    const version = typeof parsed === 'object' && parsed !== null && 'version' in parsed ? parsed.version : undefined;

    if (typeof version !== 'string') {
        throw new Error(`${manifest} has no "version" string`);
    }

    return version;
}

/** The version declared by each Overlay package; they are released together and must match. */
export function readPackageVersions(): { composer: string; npm: string } {
    return {
        composer: readVersion(join(composerPackageDir, 'composer.json')),
        npm: readVersion(join(npmPackageDir, 'package.json')),
    };
}
