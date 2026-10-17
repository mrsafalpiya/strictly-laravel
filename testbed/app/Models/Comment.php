<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\CommentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property CarbonImmutable $created_at Set when the row is created, as is the next one.
 * @property CarbonImmutable $updated_at
 * @property-read Issue $issue
 * @property-read User $user
 */
#[Fillable(['issue_id', 'user_id', 'body', 'edited_at'])]
class Comment extends Model
{
    /** @use HasFactory<CommentFactory> */
    use HasFactory;

    /** @return BelongsTo<Issue, $this> */
    public function issue(): BelongsTo
    {
        return $this->belongsTo(Issue::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Reaction, $this> */
    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'edited_at' => 'immutable_datetime',
        ];
    }
}
