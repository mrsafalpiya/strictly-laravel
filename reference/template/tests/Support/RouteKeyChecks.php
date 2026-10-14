<?php

namespace Tests\Support;

use App\Support\Wayfinder\RouteKeys;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
use Spatie\LaravelData\Resolvers\TransformedDataResolver;
use Spatie\LaravelData\Support\DataContainer;

/**
 * Checks the route-key brands (App\Support\Wayfinder\RouteKeys) against the database: whenever a test serialises
 * a Data object, every property typed `RouteKey<'Project', …>` must hold an existing Project route key. So a
 * `#[RouteKeyOf(Project::class)]` on an issue key, or a `fromModel(Membership)` class whose `id` is filled with
 * the user's id, fails (types:coverage reports it), instead of the brand making a wrong value look right.
 *
 * Every table gets its own id range in tests (`useDisjointIds()`), so an id of the wrong model never exists by
 * coincidence: a membership id is never also a user id.
 */
final class RouteKeyChecks
{
    private const int ID_RANGE = 1_000_000;

    /** @var array<string, array{data: string, property: string, model: string, field: string, value: int|string}> Brands violated in the current request. */
    private static array $failures = [];

    /** @var array<string, bool> */
    private static array $exists = [];

    public static function listen(Application $app): void
    {
        self::$exists = [];

        Event::listen(RouteMatched::class, function (): void {
            self::$failures = [];
            self::$exists = [];
        });

        $app->bind(TransformedDataResolver::class, CheckedTransformedDataResolver::class);
        DataContainer::get()->reset();
    }

    public static function useDisjointIds(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            return;
        }

        $tables = array_values(array_filter(Schema::getTableListing(schemaQualified: false), fn (string $table): bool => ! str_starts_with($table, 'sqlite_')));

        foreach ($tables as $index => $table) {
            DB::table('sqlite_sequence')->updateOrInsert(['name' => $table], ['seq' => ($index + 1) * self::ID_RANGE]);
        }
    }

    public static function check(string $class, string $property, mixed $value): void
    {
        $key = RouteKeys::inDataClass($class)[$property] ?? null;

        if ($key === null || (! is_int($value) && ! is_string($value))) {
            return;
        }

        $cacheKey = $key['model'].'|'.$key['field'].'|'.$value;
        self::$exists[$cacheKey] ??= $key['model']::query()->withoutGlobalScopes()->where($key['field'], $value)->exists();

        if (! self::$exists[$cacheKey]) {
            self::$failures[$class.'.'.$property.'='.$value] = ['data' => $class, 'property' => $property, 'model' => $key['model'], 'field' => $key['field'], 'value' => $value];
        }
    }

    /**
     * @return list<array{data: string, property: string, model: string, field: string, value: int|string}>
     */
    public static function failures(): array
    {
        return array_values(self::$failures);
    }
}
