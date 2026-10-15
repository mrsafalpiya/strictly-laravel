import { Link } from '@inertiajs/react';
import { edit } from '@/actions/App/Http/Controllers/Settings/ProfileController';

export default function ProfileTabLink() {
    return <Link href={edit({ query: { tab: 'password' } })}>Change your password</Link>;
}
