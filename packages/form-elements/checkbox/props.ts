export interface CheckboxFieldProps {
    id: string;
    question: string;
    description?: string;
    choices: string[];
    fieldRequired?: boolean;
    requiredWarning?: string;
}