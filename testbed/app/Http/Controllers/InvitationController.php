<?php

namespace App\Http\Controllers;

use App\Actions\RecordActivity;
use App\Data\Activity\MemberJoinedPayload;
use App\Data\FlashData;
use App\Data\Invitations\InvitationPreviewData;
use App\Data\Invitations\StoreInvitationData;
use App\Models\Invitation;
use App\Models\User;
use App\Models\Workspace;
use App\Pages\Invitations\ShowPage;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class InvitationController extends Controller
{
    public function __construct(private readonly RecordActivity $recordActivity) {}

    public function show(string $token, #[CurrentUser] User $user): ShowPage
    {
        return new ShowPage(invitation: InvitationPreviewData::fromModel($this->find($token), $user));
    }

    public function accept(string $token, #[CurrentUser] User $user): RedirectResponse
    {
        $invitation = $this->find($token);
        $workspace = $invitation->workspace;

        switch (InvitationPreviewData::statusFor($invitation, $user)) {
            case 'already_member':
                return to_route('workspace.dashboard', $workspace);
            case 'accepted':
                FlashData::error('This invitation has already been used.');

                return to_route('invitations.show', $token);
            case 'expired':
                FlashData::error('This invitation has expired. Ask for a new one.');

                return to_route('invitations.show', $token);
            case 'wrong_email':
                FlashData::error("This invitation was sent to {$invitation->email}.");

                return to_route('invitations.show', $token);
            case 'pending':
                break;
        }

        DB::transaction(function () use ($invitation, $workspace, $user): void {
            $workspace->memberships()->create(['user_id' => $user->id, 'role' => $invitation->role]);
            $invitation->update(['accepted_at' => now()]);
            $this->recordActivity->handle($workspace, $user, null, new MemberJoinedPayload(role: $invitation->role));
        });

        $user->forceFill(['current_workspace_id' => $workspace->id])->save();
        FlashData::success("Welcome to {$workspace->name}.");

        return to_route('workspace.dashboard', $workspace);
    }

    public function store(StoreInvitationData $data, Workspace $workspace, #[CurrentUser] User $user): RedirectResponse
    {
        $email = mb_strtolower($data->email);

        // (workspace_id, email) is unique: an expired or already-used invitation is replaced.
        $workspace->invitations()->where('email', $email)->delete();

        $invitation = $workspace->invitations()->create([
            'invited_by_id' => $user->id,
            'email' => $email,
            'role' => $data->role,
            'token' => Str::random(64),
            'expires_at' => now()->addWeek(),
        ]);

        // No mail in the Testbed App: the accept link is logged instead.
        Log::info('Workspace invitation created.', [
            'workspace' => $workspace->slug,
            'email' => $email,
            'url' => route('invitations.show', $invitation->token),
        ]);

        FlashData::success("Invited {$email}.");

        return back();
    }

    public function destroy(Workspace $workspace, Invitation $invitation): RedirectResponse
    {
        Gate::authorize('manage', $workspace);

        $invitation->delete();
        FlashData::success("Revoked the invitation for {$invitation->email}.");

        return back();
    }

    private function find(string $token): Invitation
    {
        return Invitation::query()->where('token', $token)->with(['workspace', 'invitedBy'])->firstOrFail();
    }
}
