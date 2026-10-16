// JSON.parse returns any, so .title is read from whatever the text holds unchecked.
export const draftTitle = (text: string): unknown => JSON.parse(text).title;
