import React, { FC, useEffect, useState } from "react";
import {
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
} from "@utrecht/component-library-react";

export type FileUploadProps = {
    title: string;
    description?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    variant?: 'multiple' | 'single';
    allowedTypes?: string;
    disabled?: boolean;
    onChange?: (e: {name: string, value: string | []}) => void;
}

const FileUploadField: FC<FileUploadProps> = ({
    title,
    description,
    fieldKey,
    fieldRequired = false,
    variant = "single",
    onChange,
    allowedTypes = "",
    disabled = false,
}) => {
    const randomID =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const [files, setFiles] = useState<[]>([]);

    useEffect(() => {
        if (onChange) {
            onChange({
                name: fieldKey,
                value: files,
            });
        }
    }, [files]);

    const handleFileUpload = (
        event: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const files = event.target.files;
        const filesArray = [];

        if (files) {
            if (files.length > 0) {
                for (const i in files) {
                    if (files[i] instanceof File) {
                        filesArray.push(files[i]);
                    }
                }
            }
        }

        setFiles(filesArray as []);

    };

    const acceptAttribute = allowedTypes
        ? allowedTypes
        : "";

    return (
        <FormField type="text">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={randomID}>{title}</FormLabel>
            </Paragraph>
            <FormFieldDescription>{description}</FormFieldDescription>
            <div className="utrecht-form-field__input">
                <input
                    id={randomID}
                    name={fieldKey}
                    required={fieldRequired}
                    type="file"
                    multiple={variant === "multiple"}
                    onChange={(e) => {
                        handleFileUpload(e);
                    }}
                    accept={acceptAttribute}
                    disabled={disabled}
                />
            </div>
        </FormField>
    );
};

export default FileUploadField;
