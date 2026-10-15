<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;
use App\Support\Workspaces\CurrentWorkspace;

final class CommentPolicy
{
    public function __construct(private readonly CurrentWorkspace $current) {}

    public function update(User $user, Comment $comment): bool
    {
        return $comment->user_id === $user->id;
    }

    public function delete(User $user, Comment $comment): bool
    {
        return $comment->user_id === $user->id || $this->current->role()->canManage();
    }
}
