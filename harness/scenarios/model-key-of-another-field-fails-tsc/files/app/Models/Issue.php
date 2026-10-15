<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $number
 * @property string $title
 * @property int|null $assignee_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['number', 'title', 'assignee_id'])]
final class Issue extends Model
{
    public function getRouteKeyName(): string
    {
        return 'number';
    }
}
