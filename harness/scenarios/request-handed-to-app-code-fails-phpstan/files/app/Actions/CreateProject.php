<?php

namespace App\Actions;

use Illuminate\Http\Request;

final class CreateProject
{
    public function handle(Request $request): string
    {
        $request->validate(['name' => ['required', 'string', 'max:255']]);

        return $request->string('name')->toString();
    }
}
