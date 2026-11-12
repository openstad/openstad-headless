export type ModbreakItem = {
    id: string;
    description: string;
    authorName?: string | null;
    modBreakDate: string;
    createdAt?: string;
};
export declare function normalizeModBreakDate(value?: string | null): string;
export declare const EMPTY_MODBREAK_MESSAGE = "Vul de inhoud in of verwijder de lege offici\u00EBle reactie.";
export declare function hasModBreakContent(description?: string | null): boolean;
export declare function sortModBreaksDescending<T extends {
    modBreakDate: string;
}>(items: T[]): T[];
export declare function normalizeModBreaks(items: ModbreakItem[]): ModbreakItem[];
