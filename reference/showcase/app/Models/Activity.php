<?php

namespace App\Models;

use App\Enums\ActivityType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read Workspace $workspace
 * @property-read User $user
 * @property array<string, mixed> $payload Shape depends on $type, see App\Data\Activity\ActivityData::payloadFor().
 */
#[Fillable(['workspace_id', 'issue_id', 'user_id', 'type', 'payload', 'created_at'])]
class Activity extends Model
{
    public const UPDATED_AT = null;

    /** @return BelongsTo<Workspace, $this> */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

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

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'type' => ActivityType::class,
            'payload' => 'array',
            'created_at' => 'immutable_datetime',
        ];
    }
}
