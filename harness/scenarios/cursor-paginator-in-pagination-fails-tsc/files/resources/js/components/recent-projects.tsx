import { Pagination } from '@mrsafalpiya/strictly-laravel/react';
import type { ProjectIndexData } from '@/generated';

export default function RecentProjects({ recent }: ProjectIndexData) {
    return <Pagination paginator={recent} />;
}
