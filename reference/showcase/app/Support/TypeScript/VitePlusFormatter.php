<?php

namespace App\Support\TypeScript;

use Spatie\TypeScriptTransformer\Formatters\Formatter;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/**
 * Formats generated files with the project's own formatter (`vp fmt`, oxfmt) so they read like the
 * rest of resources/js. Skipped when node_modules is not installed (e.g. a PHP-only CI job).
 */
final class VitePlusFormatter implements Formatter
{
    /**
     * @param  array<mixed>  $files
     */
    public function format(array $files): void
    {
        $files = array_values(array_filter($files, is_string(...)));

        $binary = base_path('node_modules/.bin/vp');

        if ($files === [] || ! is_file($binary)) {
            return;
        }

        $process = new Process([$binary, 'fmt', ...$files], base_path());
        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }
    }
}
