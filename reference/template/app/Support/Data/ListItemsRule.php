<?php

namespace App\Support\Data;

use BackedEnum;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validates every item of a typed list (`/** @var list<IssueStatus> *\/ array $statuses`).
 * Added automatically by StrictTypesRuleInferrer; without it an invalid item is a 500 (cast failure).
 */
final readonly class ListItemsRule implements ValidationRule
{
    /**
     * @param  'int'|'float'|'string'|'bool'|class-string<BackedEnum>  $type
     */
    public function __construct(private string $type) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value)) {
            return;
        }

        foreach ($value as $index => $item) {
            if (! self::accepts($this->type, $item)) {
                $fail("The {$attribute}.{$index} value is invalid.");

                return;
            }
        }
    }

    /**
     * @param  'int'|'float'|'string'|'bool'|class-string<BackedEnum>  $type
     */
    public static function accepts(string $type, mixed $item): bool
    {
        return match ($type) {
            'int' => is_int($item) || (is_string($item) && preg_match('/^-?\d+$/', $item) === 1),
            'float' => is_numeric($item),
            'string' => is_string($item),
            'bool' => is_bool($item) || in_array($item, [0, 1, '0', '1', 'true', 'false'], true),
            default => (is_string($item) || is_int($item)) && $type::tryFrom($item) !== null,
        };
    }
}
