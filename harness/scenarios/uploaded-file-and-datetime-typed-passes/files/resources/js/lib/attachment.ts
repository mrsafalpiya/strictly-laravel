import type { StoreAttachmentData } from '@/generated';

export function attachment(file: File): StoreAttachmentData {
    return { file, thumbnail: null, takenAt: new Date(file.lastModified).toISOString() };
}
