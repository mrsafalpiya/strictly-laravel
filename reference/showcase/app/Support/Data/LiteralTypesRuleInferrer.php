<?php

namespace App\Support\Data;

use PHPStan\PhpDocParser\Ast\ConstExpr\ConstExprIntegerNode;
use PHPStan\PhpDocParser\Ast\ConstExpr\ConstExprStringNode;
use PHPStan\PhpDocParser\Ast\PhpDoc\VarTagValueNode;
use PHPStan\PhpDocParser\Ast\Type\ConstTypeNode;
use PHPStan\PhpDocParser\Ast\Type\IdentifierTypeNode;
use PHPStan\PhpDocParser\Ast\Type\NullableTypeNode;
use PHPStan\PhpDocParser\Ast\Type\TypeNode;
use PHPStan\PhpDocParser\Ast\Type\UnionTypeNode;
use PHPStan\PhpDocParser\Lexer\Lexer;
use PHPStan\PhpDocParser\Parser\ConstExprParser;
use PHPStan\PhpDocParser\Parser\PhpDocParser;
use PHPStan\PhpDocParser\Parser\TokenIterator;
use PHPStan\PhpDocParser\Parser\TypeParser;
use PHPStan\PhpDocParser\ParserConfig;
use ReflectionProperty;
use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\RuleInferrers\RuleInferrer;
use Spatie\LaravelData\Support\DataProperty;
use Spatie\LaravelData\Support\Validation\PropertyRules;
use Spatie\LaravelData\Support\Validation\ValidationContext;

/**
 * Validates PHPDoc literal types, which TypeScript already relies on:
 *
 *     /** @var 'monday'|'sunday' *\/ public string $weekStartsOn   →  in:monday,sunday
 *
 * (For enum values, type the property with the enum itself: laravel-data validates it already.)
 *
 * Without this, the generated TS type promises 'monday' | 'sunday' while the server accepts any string.
 */
final class LiteralTypesRuleInferrer implements RuleInferrer
{
    /** @var array<string, list<string|int>|null> */
    private static array $cache = [];

    public function handle(DataProperty $property, PropertyRules $rules, ValidationContext $context): PropertyRules
    {
        $values = self::$cache[$property->className.'::'.$property->name] ??= $this->literalValues($property);

        return $values === null ? $rules : $rules->add(new In($values));
    }

    /**
     * @return list<string|int>|null
     */
    private function literalValues(DataProperty $property): ?array
    {
        $class = $property->className;

        if (! class_exists($class) || ! property_exists($class, $property->name)) {
            return null;
        }

        $docComment = (new ReflectionProperty($class, $property->name))->getDocComment();

        if ($docComment === false || ! str_contains($docComment, '@var')) {
            return null;
        }

        $config = new ParserConfig([]);
        $constExprParser = new ConstExprParser($config);
        $parser = new PhpDocParser($config, new TypeParser($config, $constExprParser), $constExprParser);
        $tokens = new TokenIterator((new Lexer($config))->tokenize($docComment));

        foreach ($parser->parse($tokens)->getVarTagValues() as $tag) {
            return $this->values($tag);
        }

        return null;
    }

    /**
     * @return list<string|int>|null
     */
    private function values(VarTagValueNode $tag): ?array
    {
        $types = $this->flatten($tag->type);
        $values = [];

        foreach ($types as $type) {
            if ($type instanceof IdentifierTypeNode && $type->name === 'null') {
                continue;
            }

            if (! $type instanceof ConstTypeNode) {
                return null;
            }

            $value = $this->constant($type);

            if ($value === null) {
                return null;
            }

            $values[] = $value;
        }

        return $values === [] ? null : $values;
    }

    /**
     * @return list<TypeNode>
     */
    private function flatten(TypeNode $type): array
    {
        return match (true) {
            $type instanceof UnionTypeNode => array_merge(...array_map($this->flatten(...), $type->types)),
            $type instanceof NullableTypeNode => $this->flatten($type->type),
            default => [$type],
        };
    }

    private function constant(ConstTypeNode $type): string|int|null
    {
        return match (true) {
            $type->constExpr instanceof ConstExprStringNode => $type->constExpr->value,
            $type->constExpr instanceof ConstExprIntegerNode => (int) $type->constExpr->value,
            default => null,
        };
    }
}
