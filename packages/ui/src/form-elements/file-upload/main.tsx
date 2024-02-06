import React, { FC, useEffect, useState } from "react";
import {
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
} from "@utrecht/component-library-react";
import { FileUploadProps } from "./props";

const FileUploadField: FC<FileUploadProps> = ({
    title,
    description,
    fieldKey,
    fieldRequired = false,
    variant = "single",
    onChange,
    allowedTypes = "",
}) => {
    const randomID =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const [files, setFiles] = useState<[]>([]);

    useEffect(() => {
        onChange({
            name: fieldKey,
            value: files,
        });
    }, [files]);

    const handleFileUpload = (
        event: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const files = event.target.files;
        const filesArray = [];

        if (files.length > 0) {
            for (const i in files) {
                if (files[i] instanceof File) {
                    filesArray.push(files[i]);
                }
            }
        }

        setFiles(filesArray);
    };

    const acceptAttribute = allowedTypes
        ? allowedTypes
        : "";

    return (
        <FormField type="text">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={randomID}>{title}</FormLabel>
                <FormFieldDescription>{description}</FormFieldDescription>
            </Paragraph>
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
                />
            </div>
        </FormField>
    );
};

export default FileUploadField;
