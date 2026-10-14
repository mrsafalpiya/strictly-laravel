<?php

namespace App\Support\TypeScript;

use Illuminate\Pagination\CursorPaginator;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\TransformedProviders\TransformedProvider;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptAlias;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptRaw;

/**
 * Overrides the paginator types shipped by spatie/laravel-typescript-transformer 3.3:
 *
 * - `data` is always a JSON list (the shipped type turns non-int keys into a Record, and laravel-data's
 *   collect() keys cursor paginators by `array-key`),
 * - Laravel 11+ paginator links carry a `page` key the shipped type omits (found by the contract tests).
 *
 * Registered after the laravel-data extension so it replaces the same references.
 */
final class PaginatorTypesProvider implements TransformedProvider
{
    public function provide(): array
    {
        return [
            $this->paginator(LengthAwarePaginator::class, 'LengthAwarePaginator', <<<'TS'
                {
                    data: TValue[];
                    links: { url: string | null; label: string; page: number | null; active: boolean }[];
                    meta: {
                        current_page: number;
                        first_page_url: string;
                        from: number | null;
                        last_page: number;
                        last_page_url: string;
                        next_page_url: string | null;
                        path: string;
                        per_page: number;
                        prev_page_url: string | null;
                        to: number | null;
                        total: number;
                    };
                }
                TS),
            $this->paginator(CursorPaginator::class, 'CursorPaginator', <<<'TS'
                {
                    data: TValue[];
                    links: { url: string | null; label: string; active: boolean }[];
                    meta: {
                        path: string;
                        per_page: number;
                        next_cursor: string | null;
                        next_page_url: string | null;
                        prev_cursor: string | null;
                        prev_page_url: string | null;
                    };
                }
                TS),
        ];
    }

    /**
     * @param  class-string  $class
     */
    private function paginator(string $class, string $name, string $typeScript): Transformed
    {
        return new Transformed(
            new TypeScriptAlias(
                new TypeScriptGeneric(
                    new TypeScriptIdentifier($name),
                    [new TypeScriptIdentifier('TKey'), new TypeScriptIdentifier('TValue')],
                ),
                new TypeScriptRaw($typeScript),
            ),
            new ClassStringReference($class),
            ['Illuminate'],
            true,
        );
    }
}
