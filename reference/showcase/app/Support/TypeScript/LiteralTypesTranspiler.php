<?php

namespace App\Support\TypeScript;

use BackedEnum;
use PHPStan\PhpDocParser\Ast\ConstExpr\ConstExprFalseNode;
use PHPStan\PhpDocParser\Ast\ConstExpr\ConstExprFloatNode;
use PHPStan\PhpDocParser\Ast\ConstExpr\ConstExprIntegerNode;
use PHPStan\PhpDocParser\Ast\ConstExpr\ConstExprStringNode;
use PHPStan\PhpDocParser\Ast\ConstExpr\ConstExprTrueNode;
use PHPStan\PhpDocParser\Ast\ConstExpr\ConstFetchNode;
use PHPStan\PhpDocParser\Ast\Type\ConstTypeNode;
use PHPStan\PhpDocParser\Ast\Type\GenericTypeNode;
use PHPStan\PhpDocParser\Ast\Type\TypeNode;
use Spatie\TypeScriptTransformer\Actions\TranspilePhpStanTypeToTypeScriptNodeAction;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptLiteral;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptUnknown;

/**
 * Adds PHPDoc literal types, which typescript-transformer 3.3 turns into `unknown`.
 * A property documented as the string 'draft', the int 3 or the enum case
 * ActivityType::Commented becomes the TypeScript literal 'draft', 3 or 'commented'.
 *
 * Needed for discriminated unions, e.g. `{ type: 'commented'; ... } | { type: 'status_changed'; ... }`.
 */
final class LiteralTypesTranspiler extends TranspilePhpStanTypeToTypeScriptNodeAction
{
    protected function resolve(TypeNode $type, ?PhpClassNode $phpClassNode): TypeScriptNode
    {
        if ($type instanceof GenericTypeNode && $this->isEnumKeyedArray($type)) {
            return $this->enumKeyedMap($type, $phpClassNode);
        }

        if (! $type instanceof ConstTypeNode) {
            return parent::resolve($type, $phpClassNode);
        }

        $expression = $type->constExpr;

        return match (true) {
            $expression instanceof ConstExprStringNode => new TypeScriptLiteral($expression->value),
            $expression instanceof ConstExprIntegerNode => new TypeScriptLiteral((int) $expression->value),
            $expression instanceof ConstExprFloatNode => new TypeScriptLiteral((float) $expression->value),
            $expression instanceof ConstExprTrueNode => new TypeScriptLiteral(true),
            $expression instanceof ConstExprFalseNode => new TypeScriptLiteral(false),
            $expression instanceof ConstFetchNode => $this->constant($expression, $phpClassNode),
            default => new TypeScriptUnknown,
        };
    }

    /** `array<value-of<IssueStatus>, int>` */
    private function isEnumKeyedArray(GenericTypeNode $type): bool
    {
        $key = $type->genericTypes[0] ?? null;

        return in_array($type->type->name, ['array', 'non-empty-array'], true)
            && count($type->genericTypes) === 2
            && $key instanceof GenericTypeNode
            && $key->type->name === 'value-of'
            && count($key->genericTypes) === 1;
    }

    /**
     * `array<value-of<IssueStatus>, int>` → `Partial<Record<IssueStatus, number>>`: PHPStan checks the keys
     * are statuses but not that every status is present, so TypeScript must not claim they all are.
     */
    private function enumKeyedMap(GenericTypeNode $type, ?PhpClassNode $phpClassNode): TypeScriptNode
    {
        /** @var GenericTypeNode $key */
        $key = $type->genericTypes[0];

        return new TypeScriptGeneric(new TypeScriptIdentifier('Partial'), [
            new TypeScriptGeneric(new TypeScriptIdentifier('Record'), [
                parent::resolve($key->genericTypes[0], $phpClassNode),
                $this->resolve($type->genericTypes[1], $phpClassNode),
            ]),
        ]);
    }

    private function constant(ConstFetchNode $node, ?PhpClassNode $phpClassNode): TypeScriptNode
    {
        $class = $this->resolveClass($node->className, $phpClassNode);

        if ($class === null || ! defined("{$class}::{$node->name}")) {
            return new TypeScriptUnknown;
        }

        $value = constant("{$class}::{$node->name}");

        return match (true) {
            $value instanceof BackedEnum => new TypeScriptLiteral($value->value),
            is_scalar($value) => new TypeScriptLiteral($value),
            default => new TypeScriptUnknown,
        };
    }
}
