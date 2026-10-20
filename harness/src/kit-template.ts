import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { featuresKey, featureSubsets, kitFeatures } from './kit-variants.ts';
import { composerPackageDir } from './paths.ts';

// What the harness needs of Kit Conversion: its manifest, its hash, and a copy of the Composer package's KitTemplate
// (packages/laravel/src/Install/KitTemplate.php), which reads the feature sections of a file under kit/.
// harness/tests/kit-conversion.test.ts checks that both render every kit file alike.

/** The converted files, under kit/. */
export const kitDir = join(composerPackageDir, 'kit');

/** An entry of kit-conversion.json (KitConversion::MANIFEST). */
export interface KitManifestEntry {
    /** Every known upstream version; per combination of `variesWith`'s features kept (featuresKey()) if it has one. */
    upstream: string[] | Record<string, string[]>;
    variesWith?: string[];
    /** The feature without which the Base Kit has no such file. */
    requires?: string;
    earlierConversions: string[];
    /** Files the conversion adds, written only together with it, so they never need earlier versions recorded. */
    adds?: string[];
    /** More of them, per feature the app must have for them to be written. */
    addsWith?: Record<string, string[]>;
}

/** kit-conversion.json: app-relative path => entry. */
export function kitManifest(): Record<string, KitManifestEntry> {
    return JSON.parse(readFileSync(join(composerPackageDir, 'kit-conversion.json'), 'utf8')) as Record<string, KitManifestEntry>;
}

/** The hash Kit Conversion compares: SHA-256 with "\r\n" line endings normalised to "\n". */
export function kitHash(content: string | Buffer): string {
    return createHash('sha256').update(content.toString().replaceAll('\r\n', '\n')).digest('hex');
}

const marker = /^[ \t]*(?:\/\/|\{?\/\*)[ \t]*@(end-)?feature\b[ \t]*([^*\s]*)[ \t]*(?:\*\/\}?)?[ \t]*$/;

/** The file for an app with $features (KitTemplate::render()). */
export function renderKitTemplate(content: string, features: readonly string[]): string {
    const kept: string[] = [];
    const open: boolean[] = [];

    content.split('\n').forEach((line, index) => {
        const match = marker.exec(line);

        if (match === null) {
            if (!open.includes(false)) {
                kept.push(line);
            }

            return;
        }

        if (match[1] === 'end-') {
            if (open.length === 0) {
                throw new Error(`An @end-feature on line ${index + 1} closes no section.`);
            }

            open.pop();

            return;
        }

        open.push(holds(match[2] ?? '', features, index + 1));
    });

    if (open.length > 0) {
        throw new Error('A @feature section is never closed with @end-feature.');
    }

    return kept.join('\n');
}

/** The file for every combination of the features it depends on, keyed by featuresKey() (KitTemplate::renderings()). */
export function kitTemplateRenderings(content: string): Map<string, string> {
    const mentioned = new Set<string>();

    for (const line of content.split('\n')) {
        const match = marker.exec(line);

        if (match !== null && match[1] === undefined) {
            for (const term of (match[2] ?? '').split('|')) {
                mentioned.add(term.replace(/^!/, ''));
            }
        }
    }

    return new Map(featureSubsets([...mentioned]).map((features) => [featuresKey(features), renderKitTemplate(content, features)]));
}

function holds(condition: string, features: readonly string[], line: number): boolean {
    if (condition === '') {
        throw new Error(`The @feature marker on line ${line} names no feature.`);
    }

    return condition.split('|').some((term) => {
        const feature = term.replace(/^!/, '');

        if (!(kitFeatures as readonly string[]).includes(feature)) {
            throw new Error(`The @feature marker on line ${line} names an unknown feature, "${feature}" (known: ${kitFeatures.join(', ')}).`);
        }

        return features.includes(feature) !== term.startsWith('!');
    });
}
