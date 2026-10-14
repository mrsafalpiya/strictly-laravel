<?php

namespace App\Console\Commands;

use App\Support\Inertia\Page;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

#[Signature('make:page {component : The Inertia component, e.g. projects/show} {--force : Overwrite existing files}')]
#[Description('Create an Inertia page: a typed App\Pages class and its React component')]
final class MakePageCommand extends Command
{
    public function handle(Filesystem $files): int
    {
        $argument = $this->argument('component');

        if (! is_string($argument)) {
            return self::INVALID;
        }

        $component = Str::of($argument)
            ->replace('\\', '/')
            ->trim('/')
            ->explode('/')
            ->map(fn (string $segment): string => Str::kebab($segment))
            ->implode('/');

        $segments = explode('/', $component);
        $class = Str::studly(array_pop($segments)).Page::SUFFIX;
        $namespace = rtrim(Page::NAMESPACE.implode('\\', array_map(Str::studly(...), $segments)), '\\');

        $phpPath = app_path('Pages/'.implode('/', array_map(Str::studly(...), $segments)).'/'.$class.'.php');
        $tsxPath = resource_path("js/pages/{$component}.tsx");

        $this->write($files, $phpPath, $this->phpStub($namespace, $class));
        $this->write($files, $tsxPath, $this->tsxStub($component));

        $this->call('typescript:transform');

        $this->components->info("Return it from a controller: return new \\{$namespace}\\{$class}(...);");

        return self::SUCCESS;
    }

    private function write(Filesystem $files, string $path, string $contents): void
    {
        $relative = Str::after($path, base_path().DIRECTORY_SEPARATOR);

        if ($files->exists($path) && $this->option('force') !== true) {
            $this->components->warn("{$relative} already exists, skipped.");

            return;
        }

        $files->ensureDirectoryExists(dirname($path));
        $files->put($path, $contents);
        $this->components->info("Created {$relative}");
    }

    private function phpStub(string $namespace, string $class): string
    {
        return <<<PHP
            <?php

            namespace {$namespace};

            use App\\Support\\Inertia\\Page;

            final class {$class} extends Page
            {
                public function __construct(
                    public string \$title,
                ) {}
            }

            PHP;
    }

    private function tsxStub(string $component): string
    {
        $function = Str::studly(str_replace('/', '-', $component));

        return <<<TSX
            import { Head } from '@inertiajs/react';
            import type { PageProps } from '@/types';

            export default function {$function}({ title }: PageProps<'{$component}'>) {
                return (
                    <>
                        <Head title={title} />
                        <h1 className="text-xl font-semibold">{title}</h1>
                    </>
                );
            }

            TSX;
    }
}
