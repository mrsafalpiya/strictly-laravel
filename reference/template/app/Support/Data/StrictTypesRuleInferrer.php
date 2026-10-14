<?php

namespace App\Support\Data;

use BackedEnum;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Numeric;
use Spatie\LaravelData\Attributes\Validation\Present;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\Rule;
use Spatie\LaravelData\Enums\DataTypeKind;
use Spatie\LaravelData\RuleInferrers\BuiltInTypesRuleInferrer;
use Spatie\LaravelData\Support\DataProperty;
use Spatie\LaravelData\Support\Validation\PropertyRules;
use Spatie\LaravelData\Support\Validation\ValidationContext;

/**
 * Makes inferred rules match the generated TypeScript:
 *
 * - `int` → `integer` (laravel-data uses `numeric`, so "1.5" passes and is silently truncated to 1).
 * - Non-nullable arrays/lists → `present` instead of `required` (`required` rejects `[]`, which the
 *   TS type `number[]` allows). Use #[Min(1)] for lists that must not be empty.
 * - Lists of scalars/enums (`list<IssueStatus>`) → every item is validated (ListItemsRule); otherwise
 *   an invalid item fails while casting, as a 500 instead of a 422.
 */
final class StrictTypesRuleInferrer extends BuiltInTypesRuleInferrer
{
    public function handle(DataProperty $property, PropertyRules $rules, ValidationContext $context): PropertyRules
    {
        $rules = parent::handle($property, $rules, $context);

        $type = $property->type->type;

        if ($type->acceptsType('int') && ! $type->acceptsType('float')) {
            $rules->removeType(Numeric::class)->add(new IntegerType);
        }

        $kind = $property->type->kind;

        if (($kind === DataTypeKind::Array || $kind === DataTypeKind::DataArray || $kind === DataTypeKind::DataCollection) && $rules->hasType(Required::class)) {
            $rules->removeType(Required::class)->prepend(new Present);
        }

        $item = $property->type->iterableItemType;

        if ($kind === DataTypeKind::Array && $item !== null && (in_array($item, ['int', 'float', 'string', 'bool'], true) || is_subclass_of($item, BackedEnum::class))) {
            $rules->add(new Rule(new ListItemsRule($item)));
        }

        return $rules;
    }
}
