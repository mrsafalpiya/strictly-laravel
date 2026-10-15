<?php

namespace App\Policies;

use App\Models\Issue;
use App\Models\User;
use App\Support\Workspaces\CurrentWorkspace;

/**
 * Issue routes are scoped to /w/{workspace}/projects/{project}/issues/{issue}, so the issue
 * is guaranteed to belong to the current workspace: the role there is what counts.
 */
final class IssuePolicy
{
    public function __construct(private readonly CurrentWorkspace $current) {}

    public function update(User $user, Issue $issue): bool
    {
        return $this->current->role()->canContribute();
    }

    public function delete(User $user, Issue $issue): bool
    {
        return $this->current->role()->canManage() || $issue->reporter_id === $user->id;
    }
}
