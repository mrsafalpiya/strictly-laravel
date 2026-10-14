<?php

namespace App\Support\TypeScript;

use App\Support\Wayfinder\RouteKeys;
use PHPStan\PhpDocParser\Ast\Type\TypeNode;
use Spatie\LaravelTypeScriptTransformer\LaravelData\Transformers\DataClassTransformer;
use Spatie\TypeScriptTransformer\PhpNodes\PhpClassNode;
use Spatie\TypeScriptTransformer\PhpNodes\PhpPropertyNode;
use Spatie\TypeScriptTransformer\TypeResolvers\Data\ParsedClass;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;

/**
 * laravel-data classes, with a model's route keys branded by the model (see App\Support\Wayfinder\RouteKeys):
 * `ProjectData::fromModel(Project $project)` + `public string $key` → `key: RouteKey<'Project', string>`, and
 * `#[RouteKeyOf(Project::class)] public string $projectKey` → `projectKey: RouteKey<'Project', string>`.
 */
final class RouteKeysDataClassTransformer extends DataClassTransformer
{
    protected function resolveTypeForProperty(
        PhpClassNode $phpClassNode,
        PhpPropertyNode $phpPropertyNode,
        ?TypeNode $annotation,
        ?ParsedClass $parsedClass = null,
    ): TypeScriptNode {
        $type = parent::resolveTypeForProperty($phpClassNode, $phpPropertyNode, $annotation, $parsedClass);
        $key = RouteKeys::forProperty($phpClassNode->getName(), $phpPropertyNode->getName());

        return $key === null ? $type : new TypeScriptRouteKey(class_basename($key['model']), $type);
    }
}
