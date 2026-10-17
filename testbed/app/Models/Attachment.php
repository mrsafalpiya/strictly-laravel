<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property CarbonImmutable $created_at Set when the row is created, as is the next one.
 * @property CarbonImmutable $updated_at
 * @property-read Issue $issue
 * @property-read User $user
 */
#[Fillable(['issue_id', 'user_id', 'disk', 'path', 'original_name', 'mime_type', 'size'])]
class Attachment extends Model
{
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
}
