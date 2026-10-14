<?php

namespace App\Support\TypeScript;

use Closure;
use Inertia\DeferProp;
use Inertia\MergeProp;
use Inertia\OnceProp;
use Inertia\OptionalProp;
use Inertia\ScrollProp;
use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptReference;
use Spatie\TypeScriptTransformer\Visitor\VisitorOperation;

/**
 * `ScrollProp<ActivityData[]>` → `ActivityData[]`: Inertia resolves its prop wrappers before the
 * JSON is sent, so the browser sees the wrapped value. (A plain `replaceType(..., 'never')` would
 * produce the invalid `never<ActivityData[]>` and crash generation.)
 */
final class UnwrapInertiaPropsVisitor
{
    private const array WRAPPERS = [ScrollProp::class, MergeProp::class, DeferProp::class, OptionalProp::class, OnceProp::class];

    /** A real closure literal: typescript-transformer inspects visitor closures with BetterReflection. */
    public static function closure(): Closure
    {
        return function (TypeScriptNode $node): ?VisitorOperation {
            if (
                ! $node instanceof TypeScriptGeneric
                || ! $node->type instanceof TypeScriptReference
                || ! $node->type->reference instanceof ClassStringReference
                || ! in_array($node->type->reference->classString, self::WRAPPERS, true)
                || ! isset($node->genericTypes[0])
            ) {
                return null;
            }

            return VisitorOperation::replace($node->genericTypes[0]);
        };
    }
}
