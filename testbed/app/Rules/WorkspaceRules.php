<?php

namespace App\Rules;

use App\Models\Workspace;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

/** `exists` rules that only accept records belonging to the given workspace. */
final class WorkspaceRules
{
    public static function project(Workspace $workspace): Exists
    {
        return Rule::exists('projects', 'id')->where('workspace_id', $workspace->id)->whereNull('archived_at');
    }

    public static function member(Workspace $workspace): Exists
    {
        return Rule::exists('memberships', 'user_id')->where('workspace_id', $workspace->id);
    }

    public static function label(Workspace $workspace): Exists
    {
        return Rule::exists('labels', 'id')->where('workspace_id', $workspace->id);
    }

    public static function cycle(Workspace $workspace): Exists
    {
        return Rule::exists('cycles', 'id')->where('workspace_id', $workspace->id);
    }

    public static function issue(Workspace $workspace): Exists
    {
        return Rule::exists('issues', 'id')->whereIn('project_id', $workspace->projects()->pluck('id')->all());
    }
}
