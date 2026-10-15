<?php

namespace App\Models;

use App\Enums\Reaction as ReactionEmoji;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read Comment $comment
 * @property-read User $user
 */
#[Fillable(['comment_id', 'user_id', 'emoji'])]
class Reaction extends Model
{
    /** @return BelongsTo<Comment, $this> */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'emoji' => ReactionEmoji::class,
        ];
    }
}
