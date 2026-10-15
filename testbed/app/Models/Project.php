<?php

namespace App\Models;

use App\Enums\Color;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read Workspace $workspace
 */
#[Fillable(['workspace_id', 'lead_id', 'key', 'name', 'description', 'color', 'archived_at'])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    /** @return BelongsTo<Workspace, $this> */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /** @return BelongsTo<User, $this> */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Issue, $this> */
    public function issues(): HasMany
    {
        return $this->hasMany(Issue::class);
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('archived_at');
    }

    public function getRouteKeyName(): string
    {
        return 'key';
    }

    /** Reserve the next per-project issue number (TRK-1, TRK-2, ...). */
    public function nextIssueNumber(): int
    {
        $this->increment('issue_counter');

        return $this->issue_counter;
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'color' => Color::class,
            'archived_at' => 'immutable_datetime',
        ];
    }
}
