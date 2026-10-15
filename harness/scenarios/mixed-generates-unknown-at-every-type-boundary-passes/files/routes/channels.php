<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('imports', fn (User $user): bool => $user->email_verified_at !== null);
