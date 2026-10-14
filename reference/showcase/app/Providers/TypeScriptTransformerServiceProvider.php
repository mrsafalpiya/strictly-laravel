<?php

namespace App\Providers;

use App\Data\FlashData;
use App\Data\SharedProps;
use App\Support\TypeScript\EnumValuesProvider;
use App\Support\TypeScript\InertiaPagesProvider;
use App\Support\TypeScript\LiteralTypesTranspiler;
use App\Support\TypeScript\PaginatorTypesProvider;
use App\Support\TypeScript\RouteKeysDataClassTransformer;
use App\Support\TypeScript\UnwrapInertiaPropsVisitor;
use App\Support\TypeScript\VitePlusFormatter;
use DateTimeInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Inertia\DeferProp;
use Inertia\MergeProp;
use Inertia\OptionalProp;
use Inertia\ScrollProp;
use Spatie\LaravelTypeScriptTransformer\LaravelData\LaravelDataTransformedProvider;
use Spatie\LaravelTypeScriptTransformer\LaravelTypeScriptTransformerExtension;
use Spatie\LaravelTypeScriptTransformer\TypeScriptTransformerApplicationServiceProvider as BaseTypeScriptTransformerServiceProvider;
use Spatie\TypeScriptTransformer\Transformers\EnumTransformer;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptRaw;
use Spatie\TypeScriptTransformer\TypeScriptTransformerConfigFactory;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;

/**
 * Generates resources/js/generated/index.ts from PHP. Nothing needs to be registered here:
 *
 * - every laravel-data `Data` class and every enum anywhere in app/ becomes a TypeScript type,
 * - every `App\Pages\*Page` class becomes `PageProps<'component'>` (see InertiaPagesProvider),
 * - every backed enum's values are exported at runtime as `enumValues` (see EnumValuesProvider).
 *
 * Runs on `php artisan typescript:transform`, automatically by Vite in dev/build.
 */
class TypeScriptTransformerServiceProvider extends BaseTypeScriptTransformerServiceProvider
{
    protected function configure(TypeScriptTransformerConfigFactory $config): void
    {
        // The transformer refuses to run without its output directory (gitignored, so absent in fresh clones).
        File::ensureDirectoryExists(resource_path('js/generated'));

        $config
            // = LaravelDataTypeScriptTransformerExtension, with PHPDoc literal types (see LiteralTypesTranspiler)
            // and route keys branded by their model (see RouteKeysDataClassTransformer).
            ->extension(new LaravelTypeScriptTransformerExtension)
            ->prependTransformer(new RouteKeysDataClassTransformer(transpilePhpStanTypeToTypeScriptTypeAction: new LiteralTypesTranspiler))
            ->provider(LaravelDataTransformedProvider::class)
            ->transformer(EnumTransformer::class)
            ->transformDirectories(...$this->directoriesToScan())
            // The Laravel extension only maps CarbonInterface; a plain DateTimeInterface would become `undefined`.
            ->replaceType(DateTimeInterface::class, 'string')
            // Uploads: a File in the browser (useForm<StoreAttachmentData> can hold it).
            ->replaceType(UploadedFile::class, new TypeScriptRaw('File'))
            // Inertia prop wrappers are resolved by Inertia before serialisation: `ScrollProp<T>` → `T`,
            // and a bare `X|MergeProp` → `X`.
            ->providedVisitorHook(UnwrapInertiaPropsVisitor::closure(), [TypeScriptGeneric::class])
            ->replaceType(MergeProp::class, 'never')
            ->replaceType(ScrollProp::class, 'never')
            ->replaceType(DeferProp::class, 'never')
            ->replaceType(OptionalProp::class, 'never')
            ->provider(new PaginatorTypesProvider)
            ->provider(new EnumValuesProvider(app_path()))
            ->provider(new InertiaPagesProvider(
                pagesDirectory: app_path('Pages'),
                sharedPropsClass: SharedProps::class,
                flashDataClass: FlashData::class,
            ))
            ->writer(new FlatModuleWriter('index.ts'))
            ->formatter(VitePlusFormatter::class);
    }

    /**
     * Every directory in app/ except Pages, which InertiaPagesProvider handles.
     *
     * @return array<int, string>
     */
    private function directoriesToScan(): array
    {
        $directories = glob(app_path('*'), GLOB_ONLYDIR);

        if ($directories === false) {
            return [];
        }

        return array_values(array_filter(
            $directories,
            fn (string $directory): bool => $directory !== app_path('Pages'),
        ));
    }
}
