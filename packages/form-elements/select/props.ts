export interface SelectFieldProps {
    title?: string;
    description?: string;
    choices?: string[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldName: string;
}