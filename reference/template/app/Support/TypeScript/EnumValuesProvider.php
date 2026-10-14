<?php

namespace App\Support\TypeScript;

use BackedEnum;
use Illuminate\Support\Str;
use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\References\CustomReference;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\TransformedProviders\TransformedProvider;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptRaw;
use Symfony\Component\Finder\Finder;

/**
 * The values of every backed enum in app/, in case order, as a runtime constant next to the generated types:
 *
 *     export const enumValues = { IssueStatus: ['backlog', 'todo', …], IssuePriority: [0, 1, …] } as const satisfies {…};
 *
 * so React iterates `enumValues.IssueStatus` (typed `readonly IssueStatus[]`) instead of `Object.keys(labels) as
 * IssueStatus[]` — a cast, and wrong for int-backed enums.
 */
final class EnumValuesProvider implements TransformedProvider
{
    public function __construct(private readonly string $directory) {}

    /**
     * @return array<int, Transformed>
     */
    public function provide(): array
    {
        $enums = $this->enums();

        if ($enums === []) {
            return [];
        }

        $values = [];
        $types = [];
        $references = [];

        foreach ($enums as $name => $class) {
            $cases = array_map(fn (BackedEnum $case): string => json_encode($case->value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE), $class::cases());
            $values[] = sprintf('    %s: [%s],', $name, implode(', ', $cases));
            $types[] = sprintf('    %s: readonly %%%s%%[];', $name, $name);
            $references[$name] = new ClassStringReference($class);
        }

        return [new Transformed(
            new TypeScriptRaw(implode("\n", [
                '/** The values of every backed enum, in case order (iterate these instead of Object.keys()). */',
                'export const enumValues = {',
                ...$values,
                '} as const satisfies {',
                ...$types,
                '};',
            ]), references: $references),
            new CustomReference('enums', 'values'),
            [],
            false,
        )];
    }

    /**
     * @return array<string, class-string<BackedEnum>> TypeScript name => enum
     */
    private function enums(): array
    {
        $enums = [];

        foreach (Finder::create()->files()->in($this->directory)->name('*.php') as $file) {
            $class = 'App\\'.Str::of($file->getRelativePathname())->replace('/', '\\')->beforeLast('.php')->value();

            if (enum_exists($class) && is_subclass_of($class, BackedEnum::class)) {
                $enums[class_basename($class)] = $class;
            }
        }

        ksort($enums);

        return $enums;
    }
}
