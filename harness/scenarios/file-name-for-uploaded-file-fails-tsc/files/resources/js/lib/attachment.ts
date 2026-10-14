import type { StoreAttachmentData } from '@/generated';

export function attachment(file: File): StoreAttachmentData {
    return { file: file.name };
}
