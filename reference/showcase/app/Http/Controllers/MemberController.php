<?php

namespace App\Http\Controllers;

use App\Data\Invitations\InvitationData;
use App\Data\Invitations\StoreInvitationData;
use App\Data\Members\MemberAbilitiesData;
use App\Data\Members\MemberData;
use App\Data\Members\MembersPageAbilitiesData;
use App\Data\Members\UpdateMemberData;
use App\Enums\WorkspaceRole;
use App\Models\Invitation;
use App\Models\Membership;
use App\Models\User;
use App\Models\Workspace;
use App\Pages\Members\IndexPage;
use App\Support\Inertia\Flash;
use App\Support\Workspaces\CurrentWorkspace;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

final class MemberController extends Controller
{
    public function __construct(private readonly CurrentWorkspace $current) {}

    public function index(Workspace $workspace, #[CurrentUser] User $user): IndexPage
    {
        $role = $this->current->role();
        $memberships = $workspace->memberships()->with('user')->get()
            ->sortBy(fn (Membership $membership): string => mb_strtolower($membership->user->name))
            ->values();
        $owners = $memberships->filter(fn (Membership $membership): bool => $membership->role === WorkspaceRole::Owner)->count();

        return new IndexPage(
            members: $memberships
                ->map(fn (Membership $membership): MemberData => MemberData::fromModel(
                    $membership,
                    isViewer: $membership->user_id === $user->id,
                    can: MemberAbilitiesData::for($user, $role, $membership, $owners),
                ))
                ->all(),
            invitations: ! $role->canManage() ? null : $workspace->invitations()
                ->whereNull('accepted_at')
                ->with('invitedBy')
                ->latest('id')
                ->get()
                ->map(fn (Invitation $invitation): InvitationData => InvitationData::fromModel($invitation))
                ->all(),
            inviteDefaults: new StoreInvitationData(email: '', role: WorkspaceRole::Member),
            can: MembersPageAbilitiesData::forViewer($workspace, $role),
        );
    }

    public function update(UpdateMemberData $data, Workspace $workspace, Membership $membership, #[CurrentUser] User $user): RedirectResponse
    {
        abort_unless($this->abilities($workspace, $membership, $user)->updateRole, 403);

        $membership->update(['role' => $data->role]);
        $membership->load('user');

        Flash::success("{$membership->user->name} is now {$data->role->value}.");

        return back();
    }

    public function destroy(Workspace $workspace, Membership $membership, #[CurrentUser] User $user): RedirectResponse
    {
        abort_unless($this->abilities($workspace, $membership, $user)->remove, 403);

        $member = $membership->user()->firstOrFail();
        $membership->delete();

        if ($member->current_workspace_id === $workspace->id) {
            $member->forceFill(['current_workspace_id' => null])->save();
        }

        Flash::success("Removed {$member->name} from {$workspace->name}.");

        return back();
    }

    private function abilities(Workspace $workspace, Membership $membership, User $user): MemberAbilitiesData
    {
        Gate::authorize('manage', $workspace);

        $owners = $workspace->memberships()->where('role', WorkspaceRole::Owner)->count();

        return MemberAbilitiesData::for($user, $this->current->role(), $membership, $owners);
    }
}
