<?php

namespace Tests\Support;

use Illuminate\Http\Request;
use Illuminate\Routing\Route;

/**
 * Overrides every Request method that reads input by key and records the keys (InputReads). Methods not listed
 * here (`boolean()`, `string()`, `filled()`, `missing()`, `whenHas()`, …) go through `input()` or `has()`, and
 * JSON bodies are read through `input()` too.
 *
 * @phpstan-require-extends Request
 */
trait TracksInputReads
{
    public function input(mixed $key = null, mixed $default = null): mixed
    {
        if (is_string($key)) {
            InputReads::record($key);
        }

        return parent::input($key, $default);
    }

    /** @return array<array-key, mixed> */
    public function all(mixed $keys = null): array
    {
        self::recordKeys($keys === null ? [] : (is_array($keys) ? $keys : func_get_args()));

        return parent::all(...func_get_args());
    }

    /** @return array<array-key, mixed> */
    public function only(mixed $keys): array
    {
        self::recordKeys(is_array($keys) ? $keys : func_get_args());

        return parent::only(...func_get_args());
    }

    /** @param  string|array<array-key, mixed>  $key */
    public function has(mixed $key): bool
    {
        $keys = is_array($key) ? $key : func_get_args();
        self::recordKeys($keys);

        return parent::has($keys);
    }

    /** @param  string|array<array-key, mixed>  $keys */
    public function hasAny(mixed $keys): bool
    {
        $keys = is_array($keys) ? $keys : func_get_args();
        self::recordKeys($keys);

        return parent::hasAny($keys);
    }

    public function get(string $key, mixed $default = null): mixed
    {
        InputReads::record($key);

        return parent::get($key, $default);
    }

    /** @return ($key is null ? array<array-key, mixed> : mixed) */
    public function query(mixed $key = null, mixed $default = null): mixed
    {
        if (is_string($key)) {
            InputReads::record($key);
        }

        return parent::query($key, $default);
    }

    /** @return ($key is null ? array<array-key, mixed> : mixed) */
    public function post(mixed $key = null, mixed $default = null): mixed
    {
        if (is_string($key)) {
            InputReads::record($key);
        }

        return parent::post($key, $default);
    }

    public function file(mixed $key = null, mixed $default = null): mixed
    {
        if (is_string($key)) {
            InputReads::record($key);
        }

        return parent::file($key, $default);
    }

    public function offsetExists(mixed $offset): bool
    {
        $this->recordProperty($offset);

        return parent::offsetExists($offset);
    }

    public function __get(mixed $key): mixed
    {
        $this->recordProperty($key);

        return parent::__get($key);
    }

    /** `$request->password` reads input, `$request->project` a route parameter. */
    private function recordProperty(mixed $key): void
    {
        $route = $this->route();

        if (is_string($key) && ! ($route instanceof Route && $route->hasParameter($key))) {
            InputReads::record($key);
        }
    }

    /**
     * @param  array<mixed>  $keys
     */
    private static function recordKeys(array $keys): void
    {
        InputReads::record(...array_values(array_filter($keys, is_string(...))));
    }
}
