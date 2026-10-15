import type { UserData } from '@/generated';

// meta is mixed in PHP, so unknown here: the assertion reads it as a user unchecked.
export const authorName = (meta: unknown): string => (meta as UserData).name;
