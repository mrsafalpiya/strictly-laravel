import { reset } from '@/routes/password';

export function resetLink(token: string, email: string): string {
    return reset.url(token, { query: { email } });
}
