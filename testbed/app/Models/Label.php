<?php

namespace App\Models;

use App\Enums\Color;
use Database\Factories\LabelFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property-read Workspace $workspace
 */
#[Fillable(['workspace_id', 'name', 'color'])]
class Label extends Model
{
    /** @use HasFactory<LabelFactory> */
    use HasFactory;

    /** @return BelongsTo<Workspace, $this> */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /** @return BelongsToMany<Issue, $this> */
    public function issues(): BelongsToMany
    {
        return $this->belongsToMany(Issue::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'color' => Color::class,
        ];
    }
}
