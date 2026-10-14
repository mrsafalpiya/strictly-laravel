<?php

namespace App\Support\Data;

use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Spatie\LaravelData\Support\DataConfig;
use Spatie\TypeScriptTransformer\Attributes\Hidden;

/**
 * The query string of a GET route, e.g. list filters (`?statuses[]=todo&sort=priority`).
 *
 * Type-hint the subclass in the controller (`public function index(IssueFiltersData $filters)`) and:
 *
 * - parsing is lenient: invalid list items are dropped and keys that fail validation fall back to
 *   their defaults, so a stale bookmark or a hand-edited URL never 422s;
 * - Wayfinder's generated route function for that action gets a typed `query` option
 *   (`index(workspace, { query: { statuses: ['todo'] } })`), see App\Support\Wayfinder\RouteTypes.
 *
 * Give every property a default: an absent key means "no filter".
 */
#[Hidden]
abstract class QueryData extends InputData
{
    public static function from(mixed ...$payloads): static
    {
        if (count($payloads) === 1 && $payloads[0] instanceof Request) {
            return static::fromQuery($payloads[0]);
        }

        return parent::from(...$payloads);
    }

    public static function fromQuery(Request $request): static
    {
        /** @var array<string, mixed> $input */
        $input = $request->query->all();
        $class = app(DataConfig::class)->getDataClass(static::class);

        foreach ($class->properties as $property) {
            $key = $property->inputMappedName ?? $property->name;
            $item = $property->type->iterableItemType;

            if (! isset($input[$key]) || ! is_array($input[$key]) || $item === null || ! self::isListItemType($item)) {
                continue;
            }

            $input[$key] = array_values(array_filter($input[$key], fn (mixed $value): bool => ListItemsRule::accepts($item, $value)));
        }

        $invalid = Validator::make($input, static::getValidationRules($input))->errors()->keys();

        foreach ($invalid as $key) {
            unset($input[explode('.', $key)[0]]);
        }

        // An array payload is not validated again (only Request payloads are).
        return parent::from($input);
    }

    /**
     * @phpstan-assert-if-true 'int'|'float'|'string'|'bool'|class-string<BackedEnum> $type
     */
    private static function isListItemType(string $type): bool
    {
        return in_array($type, ['int', 'float', 'string', 'bool'], true) || is_subclass_of($type, BackedEnum::class);
    }
}
