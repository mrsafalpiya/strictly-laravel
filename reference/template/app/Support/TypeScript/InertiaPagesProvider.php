<?php

namespace App\Support\TypeScript;

use App\Support\Inertia\Page;
use LogicException;
use Spatie\TypeScriptTransformer\Actions\DiscoverTypesAction;
use Spatie\TypeScriptTransformer\Actions\TransformTypesAction;
use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\References\CustomReference;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\TransformedProviders\ConfigAwareTransformedProvider;
use Spatie\TypeScriptTransformer\TransformedProviders\TransformedProvider;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptAlias;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptObject;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptProperty;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptRaw;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptReference;
use Spatie\TypeScriptTransformer\TypeScriptTransformerConfig;

/**
 * Generates everything that ties Inertia pages to their props:
 *
 *     export type SettingsProfilePage = { mustVerifyEmail: boolean; status: string | null };
 *     export type InertiaPages = { 'settings/profile': SettingsProfilePage; ... };
 *     export type PageComponent = keyof InertiaPages;
 *     export type PageProps<K extends PageComponent> = InertiaPages[K];
 *     declare module '@inertiajs/core' { interface InertiaConfig { sharedPageProps: SharedProps; flashDataType: FlashData } }
 *     type __PageComponentCheck = [CheckPage<'settings/profile', typeof import('@/pages/settings/profile').default>, ...];
 *
 * The last line makes `tsc` fail when a page file is missing, or when a page component asks
 * for a prop the server does not send.
 *
 * Page classes are transformed here (not by the default directory scan) so that each one is
 * named after its component: `App\Pages\Projects\ShowPage` and `App\Pages\Issues\ShowPage`
 * would otherwise both become `ShowPage`.
 */
final class InertiaPagesProvider implements ConfigAwareTransformedProvider, TransformedProvider
{
    private const string GROUP = 'inertia';

    private TypeScriptTransformerConfig $config;

    /**
     * @param  class-string|null  $sharedPropsClass
     * @param  class-string|null  $flashDataClass
     */
    public function __construct(
        private readonly string $pagesDirectory,
        private readonly ?string $sharedPropsClass = null,
        private readonly ?string $flashDataClass = null,
        private readonly string $pagesImportPrefix = '@/pages/',
    ) {}

    public function setConfig(TypeScriptTransformerConfig $config): void
    {
        $this->config = $config;
    }

    /**
     * @return array<int, Transformed>
     */
    public function provide(): array
    {
        $transformed = [];
        /** @var array<string, class-string> $pages */
        $pages = [];

        $nodes = is_dir($this->pagesDirectory)
            ? (new DiscoverTypesAction)->execute([$this->pagesDirectory])
            : [];

        foreach ($nodes as $node) {
            /** @var class-string $class */
            $class = $node->getName();

            if ($node->isAbstract() || ! is_subclass_of($class, Page::class)) {
                continue;
            }

            $type = (new TransformTypesAction)->transformClassNode($this->config->transformers, $node);
            $alias = $type?->getNode();

            if ($type === null || ! $alias instanceof TypeScriptAlias) {
                throw new LogicException("Could not transform page [{$class}] to TypeScript.");
            }

            $component = Page::componentFor($class);

            if (isset($pages[$component])) {
                throw new LogicException("Both [{$pages[$component]}] and [{$class}] render [{$component}].");
            }

            $name = Page::typeScriptNameFor($class);
            $alias->identifier = new TypeScriptIdentifier($name);
            $type->nameAs($name);

            $pages[$component] = $class;
            $transformed[] = $type;
        }

        ksort($pages);

        return [...$transformed, ...$this->pageMap($pages), ...$this->inertiaConfig(), ...$this->componentCheck($pages)];
    }

    /**
     * @param  array<string, class-string>  $pages
     * @return array<int, Transformed>
     */
    private function pageMap(array $pages): array
    {
        $properties = [];

        foreach ($pages as $component => $class) {
            $properties[] = new TypeScriptProperty($component, new TypeScriptReference(new ClassStringReference($class)));
        }

        return [
            new Transformed(
                new TypeScriptAlias(new TypeScriptIdentifier('InertiaPages'), new TypeScriptObject($properties)),
                new CustomReference(self::GROUP, 'pages'),
                [],
                true,
            ),
            new Transformed(
                new TypeScriptRaw(implode("\n", [
                    'export type PageComponent = keyof %InertiaPages%;',
                    'export type PageProps<K extends PageComponent> = %InertiaPages%[K];',
                ]), references: ['InertiaPages' => new CustomReference(self::GROUP, 'pages')]),
                new CustomReference(self::GROUP, 'helpers'),
                [],
                false,
            ),
        ];
    }

    /**
     * @return array<int, Transformed>
     */
    private function inertiaConfig(): array
    {
        $lines = [];
        $references = [];

        if ($this->sharedPropsClass !== null) {
            $lines[] = '        sharedPageProps: %SharedProps%;';
            $references['SharedProps'] = $this->sharedPropsClass;
        }

        if ($this->flashDataClass !== null) {
            $lines[] = '        flashDataType: %FlashData%;';
            $references['FlashData'] = $this->flashDataClass;
        }

        if ($lines === []) {
            return [];
        }

        return [new Transformed(
            new TypeScriptRaw(implode("\n", [
                "declare module '@inertiajs/core' {",
                '    export interface InertiaConfig {',
                ...$lines,
                '    }',
                '}',
            ]), references: $references),
            new CustomReference(self::GROUP, 'config'),
            [],
            false,
        )];
    }

    /**
     * @param  array<string, class-string>  $pages
     * @return array<int, Transformed>
     */
    private function componentCheck(array $pages): array
    {
        if ($pages === []) {
            return [];
        }

        $checks = array_map(
            fn (string $component): string => sprintf(
                "    CheckPage<'%s', typeof import('%s%s').default>,",
                $component, $this->pagesImportPrefix, $component,
            ),
            array_keys($pages),
        );

        return [new Transformed(
            new TypeScriptRaw(implode("\n", [
                '// Fails to compile when a page file is missing or its component expects props the server does not send.',
                'type CheckPage<K extends PageComponent, C extends (props: %InertiaPages%[K]) => unknown> = [K, C];',
                'export type __PageComponentCheck = [',
                ...$checks,
                '];',
            ]), references: ['InertiaPages' => new CustomReference(self::GROUP, 'pages')]),
            new CustomReference(self::GROUP, 'check'),
            [],
            false,
        )];
    }
}
