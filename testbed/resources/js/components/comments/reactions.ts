import { enumValues } from '@/generated';
import type { Reaction } from '@/generated';

/**
 * Accessible names for the App\Enums\Reaction cases. `satisfies Record<Reaction, …>` makes a new
 * PHP case fail `tsc` here until it is labelled (belongs in lib/domain.ts with the other enums).
 */
export const reactions = {
    '👍': 'Thumbs up',
    '❤️': 'Heart',
    '🎉': 'Party',
    '👀': 'Eyes',
    '🚀': 'Rocket',
} as const satisfies Record<Reaction, string>;

export const reactionValues = enumValues.Reaction;
