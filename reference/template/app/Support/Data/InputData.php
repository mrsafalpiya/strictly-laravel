<?php

namespace App\Support\Data;

use Spatie\LaravelData\Attributes\MergeValidationRules;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Hidden;

/**
 * Base class for request payloads (type-hint the subclass in a controller to validate the request).
 *
 * - Rules from `rules()` are MERGED with the rules inferred from the property types. Plain laravel-data
 *   *replaces* them per key, so adding `'unique:…'` for `$slug` would silently drop `required|string`.
 * - Add `public static function authorize(): bool` to check permissions BEFORE validation runs
 *   (otherwise an unauthorized user gets 422 validation errors instead of 403).
 */
#[Hidden]
#[MergeValidationRules]
abstract class InputData extends Data {}
