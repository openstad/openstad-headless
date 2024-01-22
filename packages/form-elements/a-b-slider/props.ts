export interface RangeSliderProps {
    question: string;
    description?: string;
    labelA: string;
    labelB: string;
    titleA: string;
    titleB: string;
    descriptionA?: string;
    descriptionB?: string;
    fieldRequired?: boolean;
    fieldKey: string;
    showLabels?: boolean;
    minCharacters?: number;
    maxCharacters?: number;
}