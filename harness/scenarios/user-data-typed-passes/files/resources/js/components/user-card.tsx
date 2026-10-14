import type { UserData } from '@/generated';

export function UserCard({ user }: { user: UserData }) {
    const id: number = user.id;
    const verifiedAt: string | null = user.email_verified_at;

    return (
        <p data-user={id}>
            {user.name} ({user.email}){verifiedAt === null && ', unverified'}
        </p>
    );
}
