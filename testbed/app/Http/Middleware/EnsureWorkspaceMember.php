<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Models\Workspace;
use App\Support\Workspaces\CurrentWorkspace;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureWorkspaceMember
{
    public function __construct(private readonly CurrentWorkspace $current) {}

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $workspace = $request->route('workspace');
        $user = $request->user();

        abort_unless($workspace instanceof Workspace && $user instanceof User, 404);

        $role = $user->roleIn($workspace);

        abort_if($role === null, 404);

        $this->current->set($workspace, $role);

        if ($user->current_workspace_id !== $workspace->id) {
            $user->forceFill(['current_workspace_id' => $workspace->id])->save();
        }

        return $next($request);
    }
}
