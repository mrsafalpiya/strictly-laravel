<?php

namespace App\Support\Data;

use Attribute;
use Illuminate\Database\Eloquent\Model;

/**
 * On a Data property holding another model's route key (`#[RouteKeyOf(Project::class)] public string $projectKey`):
 * typed `RouteKey<'Project', string>`, so it can be passed to a route taking a project (App\Support\Wayfinder\RouteKeys).
 * A class's own route key (`key` of a class built `fromModel(Project $project)`) needs no attribute.
 *
 * Checked in tests: every value a response sends must be an existing route key of that model (`field`, default
 * the model's getRouteKeyName()).
 */
#[Attribute(Attribute::TARGET_PROPERTY)]
final readonly class RouteKeyOf
{
    /**
     * @param  class-string<Model>  $model
     */
    public function __construct(public string $model, public ?string $field = null) {}
}
