import type { ProjectIndexData } from '@/generated';

type PageLink = ProjectIndexData['projects']['links'][number];

/** A link shaped like the pre-Laravel 11 paginator's, which had no page number. */
export const firstPage: PageLink = { url: null, label: '1', active: true };
