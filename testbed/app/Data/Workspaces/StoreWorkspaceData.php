<?php

namespace App\Data\Workspaces;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Regex;
use Spatie\LaravelData\Attributes\Validation\Unique;
use StrictlyLaravel\Data\InputData;

/**
 * POST /workspaces. Also the initial form state sent by Workspaces\CreatePage.
 */
final class StoreWorkspaceData extends InputData
{
    /** Lowercase words separated by single dashes: "acme", "acme-labs-2". Mirrored in components/workspaces/slug.ts. */
    public const string SLUG_PATTERN = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

    public function __construct(
        #[Max(100)]
        public string $name,
        #[Min(2), Max(50), Regex(self::SLUG_PATTERN), Unique('workspaces', 'slug')]
        public string $slug,
    ) {}

    /**
     * @return array<string, string>
     */
    public static function messages(): array
    {
        return [
            'slug.regex' => 'Use lowercase letters, numbers and single dashes only.',
            'slug.unique' => 'This URL is already taken.',
        ];
    }
}
