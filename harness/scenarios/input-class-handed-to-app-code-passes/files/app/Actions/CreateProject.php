<?php

namespace App\Actions;

use App\Data\StoreProjectData;
use App\Models\User;

final class CreateProject
{
    public function handle(StoreProjectData $data, User $owner): string
    {
        session()->put('last_project', "{$owner->name}: {$data->name}");

        return $data->name;
    }

    public function forget(?User $owner): void
    {
        if ($owner !== null) {
            session()->forget('last_project');
        }
    }
}
