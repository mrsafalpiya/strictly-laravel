import type { MemberData } from '@/generated';

export function contact(member: MemberData): string {
    return `${member.name} <${member.email}>`;
}
