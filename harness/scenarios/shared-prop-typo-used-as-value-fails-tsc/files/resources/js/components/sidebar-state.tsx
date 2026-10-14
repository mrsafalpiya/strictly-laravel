import { usePage } from '@inertiajs/react';

export function SidebarState() {
    const isOpen: boolean = usePage().props.sidebarOpne;

    return <p>{isOpen ? 'Sidebar open' : 'Sidebar closed'}</p>;
}
