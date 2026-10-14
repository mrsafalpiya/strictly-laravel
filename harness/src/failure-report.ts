import { tail } from './run.ts';

// Turns the output of a failed fresh-install stage (`strictly:install` or a `ci:check` step) into a report that names
// the stage and each file that broke, so a failing nightly run says what to fix without digging through the log.

export interface Diagnostic {
    /** App-relative path, when the tool names one. */
    file?: string;
    line?: number;
    message: string;
}

export interface FailureReport {
    /** `strictly:install`, `ci:check:<step>`, or the fixture-preparation command that failed. */
    stage: string;
    /** Empty when no known tool format matched; the caller then shows the output's tail. */
    diagnostics: Diagnostic[];
}

export function failureReport(stage: string, output: string): FailureReport {
    const diagnostics: Diagnostic[] = [];
    // The message of the last oxlint diagnostic header, waiting for its `,-[file:line:col]` location line.
    let oxlintMessage: string | undefined;
    // The file of the PHPStan error table being read (each table ends with a blank line).
    let phpstanFile: string | undefined;
    // The failed Pest test and its message, waiting for its `at <file>:<line>` line.
    let pestFailure: { test: string; message?: string } | undefined;
    // The installer's last reported row, which its `ERROR <message>` line (if any) explains.
    let installerRow: Diagnostic | undefined;
    let match: RegExpExecArray | null;

    for (const line of output.split('\n')) {
        if (stage === 'strictly:install') {
            // `<hook or file> .... <status>` per hook; anything but applied/unchanged broke, and a failed hook's
            // exception follows as ` ERROR <message>`.
            if ((match = /^\s*(.+?) \.{2,} (.+?)\s*$/.exec(line)) !== null) {
                const [label, status] = [group(match, 1), group(match, 2)];
                installerRow = undefined;

                if (status !== 'applied' && status !== 'unchanged') {
                    installerRow = /^\S+$/.test(label) ? { file: label, message: status } : { message: `${label}: ${status}` };
                    diagnostics.push(installerRow);
                }
            } else if (installerRow !== undefined && (match = /^\s*ERROR\s+(.+?)\s*$/.exec(line)) !== null) {
                installerRow.message += `: ${group(match, 1)}`;
                installerRow = undefined;
            }
        } else if (line.trim() === '') {
            phpstanFile = undefined;
        } else if ((match = /^\s*Line\s+(\S+)\s*$/.exec(line)) !== null) {
            // PHPStan: a table per file, headed `Line   app/X.php`, with `  7      <message>` rows
            phpstanFile = group(match, 1);
        } else if (phpstanFile !== undefined && (match = /^\s*(\d+)\s+(.+?)\s*$/.exec(line)) !== null) {
            diagnostics.push({ file: phpstanFile, line: Number(match[1]), message: group(match, 2) });
        } else if ((match = /^\s*FAILED\s+(.+?)\s*$/.exec(line)) !== null) {
            // Pest: ` FAILED  Tests\Feature\XTest > name`, the message, then `at tests/Feature/XTest.php:4`
            pestFailure = { test: group(match, 1) };
        } else if (pestFailure !== undefined && (match = /^\s*at (\S+):(\d+)$/.exec(line)) !== null) {
            const message = pestFailure.message === undefined ? pestFailure.test : `${pestFailure.test}: ${pestFailure.message}`;
            diagnostics.push({ file: group(match, 1), line: Number(match[2]), message });
            pestFailure = undefined;
        } else if (pestFailure !== undefined && pestFailure.message === undefined) {
            pestFailure.message = line.trim();
        } else if ((match = /^\s*⨯ (\S+)\s+(.+?)\s*$/.exec(line)) !== null) {
            // Pint --test: `  ⨯ app/X.php    single_quote, braces_position`
            diagnostics.push({ file: group(match, 1), message: `Pint: ${group(match, 2)}` });
        } else if ((match = /^(\S+)\((\d+),\d+\): (error TS\d+: .*)$/.exec(line)) !== null) {
            // tsc: resources/js/x.ts(1,7): error TS2322: ...
            diagnostics.push({ file: group(match, 1), line: Number(match[2]), message: group(match, 3) });
        } else if ((match = /^\s*[x!×⚠] (\S+\(\S+\): .*)$/.exec(line)) !== null) {
            // oxlint: `! eslint(no-debugger): ...`, then `,-[resources/js/x.ts:3:1]`
            oxlintMessage = group(match, 1);
        } else if (oxlintMessage !== undefined && (match = /^\s*,-\[(.+):(\d+):\d+\]$/.exec(line)) !== null) {
            diagnostics.push({ file: group(match, 1), line: Number(match[2]), message: oxlintMessage });
            oxlintMessage = undefined;
        } else if ((match = /^(\S+\.\w+) \(\d+ms\)$/.exec(line)) !== null) {
            // oxfmt: one `<file> (<n>ms)` line per unformatted file
            diagnostics.push({ file: group(match, 1), message: 'formatting issues (oxfmt)' });
        }
    }

    return { stage, diagnostics };
}

function group(match: RegExpExecArray, index: number): string {
    return match[index] ?? '';
}

/** `file:line: message`, or just the message when no file is named. */
export function describeDiagnostic(diagnostic: Diagnostic): string {
    const location = diagnostic.file === undefined ? '' : `${diagnostic.file}${diagnostic.line === undefined ? '' : `:${diagnostic.line}`}: `;

    return `${location}${diagnostic.message}`;
}

/** GitHub shows at most this many error annotations per step. */
const maxAnnotations = 10;

/**
 * GitHub Actions `::error` workflow commands: one per diagnostic, or one carrying the output's tail when no known
 * format matched. They show on the run's summary page, titled with the stage. The files live in a fixture app, not in
 * this repository, so they go in the message rather than the `file` property.
 */
export function githubAnnotations(report: FailureReport, output: string): string[] {
    const title = `Fresh install failed at ${report.stage}`;
    let messages = report.diagnostics.length > 0 ? report.diagnostics.map(describeDiagnostic) : [tail(output, 20)];

    if (messages.length > maxAnnotations) {
        messages = [...messages.slice(0, maxAnnotations - 1), `…and ${messages.length - maxAnnotations + 1} more; see the job log`];
    }

    return messages.map((message) => `::error title=${escapeProperty(title)}::${escapeData(message)}`);
}

function escapeData(value: string): string {
    return value.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
}

function escapeProperty(value: string): string {
    return escapeData(value).replaceAll(':', '%3A').replaceAll(',', '%2C');
}
