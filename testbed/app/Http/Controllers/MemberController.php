<?php

namespace App\Http\Controllers;

use App\Data\FlashData;
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
                ->values()
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

    /** UpdateMemberData::authorize() decides who may change this membership's role. */
    public function update(UpdateMemberData $data, Workspace $workspace, Membership $membership): RedirectResponse
    {
        $membership->update(['role' => $data->role]);
        $membership->load('user');

        FlashData::success("{$membership->user->name} is now {$data->role->value}.");

        return back();
    }

    public function destroy(Workspace $workspace, Membership $membership, #[CurrentUser] User $user): RedirectResponse
    {
        Gate::authorize('manage', $workspace);
        abort_unless(MemberAbilitiesData::ofViewer($user, $this->current, $membership)->remove, 403);

        $member = $membership->user()->firstOrFail();
        $membership->delete();

        if ($member->current_workspace_id === $workspace->id) {
            $member->forceFill(['current_workspace_id' => null])->save();
        }

        FlashData::success("Removed {$member->name} from {$workspace->name}.");

        return back();
    }
}
