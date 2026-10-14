<?php

namespace App\Support\TypeScript;

use Spatie\TypeScriptTransformer\Attributes\NodeVisitable;
use Spatie\TypeScriptTransformer\Data\WritingContext;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;

/** `import('@/lib/routes').RouteKey<'Project', string>`: a model's route key (RouteKeysDataClassTransformer). */
final class TypeScriptRouteKey implements TypeScriptNode
{
    public function __construct(
        public string $model,
        #[NodeVisitable]
        public TypeScriptNode $type,
    ) {}

    public function write(WritingContext $context): string
    {
        return sprintf("import('@/lib/routes').RouteKey<'%s', %s>", $this->model, $this->type->write($context));
    }
}
