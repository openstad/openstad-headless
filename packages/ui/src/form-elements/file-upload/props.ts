export interface FileUploadProps {
    title: string;
    description?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    variant?: 'multiple' | 'single';
    allowedTypes?: string;
}