export declare function parseEditorHtml(html: string): HTMLElement | null;
/**
 * Trix appends trailing <br> elements to block ends when it serializes
 * editor content, so every load/serialize round-trip grows the stored
 * HTML. This strips those meaningless trailing breaks while keeping
 * intentional empty-line blocks (like <p><br></p>) and breaks in the
 * middle of a block intact.
 */
export declare function stripTrailingBreaks(html: string): string;
