<?php

namespace App\Models;

use App\Data\Issues\IssueFiltersData;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read Workspace $workspace
 * @property-read User $user
 * @property IssueFiltersData $filters
 */
#[Fillable(['workspace_id', 'user_id', 'name', 'filters'])]
class SavedView extends Model
{
    /** @return BelongsTo<Workspace, $this> */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
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
            'filters' => IssueFiltersData::class,
        ];
    }
}
