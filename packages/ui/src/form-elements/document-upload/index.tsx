import React, { FC, useEffect, useState } from "react";
import {
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
} from "@utrecht/component-library-react";

import { FilePond, registerPlugin } from 'react-filepond'
import { FilePondFile, FilePondErrorDescription } from 'filepond'
import 'filepond/dist/filepond.min.css'
import './document-upload.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateType);

const filePondSettings = {
    labelIdle: "Sleep document(en) naar deze plek of <span class='filepond--label-action'>klik hier</span>",
    labelInvalidField: 'Veld bevat ongeldige documenten',
    labelFileWaitingForSize: 'Wachtend op grootte',
    labelFileSizeNotAvailable: 'Grootte niet beschikbaar',
    labelFileCountSingular: 'Document in lijst',
    labelFileCountPlural: 'Documenten in lijst',
    labelFileLoading: 'Laden',
    labelFileAdded: 'Toegevoegd',
    labelFileLoadError: 'Fout bij het uploaden',
    labelFileRemoved: 'Verwijderd',
    labelFileRemoveError: 'Fout bij het verwijderen',
    labelFileProcessing: 'Uploaden',
    labelFileProcessingComplete: 'Document geladen',
    labelFileProcessingAborted: 'Upload geannuleerd',
    labelFileProcessingError: 'Fout tijdens uploaden',
    labelFileProcessingRevertError: 'Fout tijdens terugdraaien',
    labelTapToCancel: 'tik om te annuleren',
    labelTapToRetry: 'tik om opnieuw te proberen',
    labelTapToUndo: 'tik om ongedaan te maken',
    labelButtonRemoveItem: 'Verwijderen',
    labelButtonAbortItemLoad: 'Abort',
    labelButtonRetryItemLoad: 'Retry',
    labelButtonAbortItemProcessing: 'Verwijder',
    labelButtonUndoItemProcessing: 'Undo',
    labelButtonRetryItemProcessing: 'Retry',
    labelButtonProcessItem: 'Upload',
    labelFileTypeNotAllowed: 'Bestandstype is niet toegestaan',
    allowFileSizeValidation: true,
    maxFileSize: '8mb',
    name: 'document',
    maxParallelUploads: 1
};

export type DocumentUploadProps = {
    title: string;
    description?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    allowedTypes?: string[];
    disabled?: boolean;
    multiple?: boolean;
    type?: string;
    onChange?: (e: { name: string; value: { name: string; url: string }[] }) => void;
    imageUrl?: string;
}

const DocumentUploadField: FC<DocumentUploadProps> = ({
    title,
    description,
    fieldKey,
    fieldRequired = false,
    multiple = false,
    onChange,
    allowedTypes = ['application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    disabled = false,
    ...props
}) => {
    const randomID =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const [files, setDocuments] = useState<FilePondFile[]>([]);
    const [uploadedDocuments, setUploadedDocuments] = useState<{ name: string, url: string }[]>([]);

    useEffect(() => {
        if (onChange) {
            onChange({
                name: fieldKey,
                value: uploadedDocuments,
            });
        }
    }, [uploadedDocuments.length]);

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
                <FilePond
                    files={files.map(file => file.file)}
                    onupdatefiles={(fileItems: FilePondFile[]) => {
                        setDocuments(fileItems);
                    }}
                    allowMultiple={multiple}
                    server={{
                        process: {
                            url: props?.imageUrl + '/documents',
                            method: 'POST',
                            onload: (response: any) => {
                                const currentDocuments = [...uploadedDocuments];
                                currentDocuments.push(JSON.parse(response)[0]);

                                setUploadedDocuments(currentDocuments);

                                return JSON.stringify(currentDocuments); // Dit heeft echt geen nut, maar het lost wel de TS problemen op
                            },
                        },
                        fetch: props?.imageUrl + '/documents',
                        revert: null,
                    }}
                    onremovefile={(error: FilePondErrorDescription | null, file: FilePondFile) => {
                        const fileName = file?.file?.name;
                        if (!!fileName) {
                            const updatedDocuments = uploadedDocuments.filter(item => item.name !== fileName);
                            setUploadedDocuments(updatedDocuments);
                        }
                    }}
                    id={randomID}
                    required={fieldRequired}
                    disabled={disabled}
                    acceptedFileTypes={typeof acceptAttribute === 'string' ? [acceptAttribute] : acceptAttribute}
                    {...filePondSettings}
                />

            </div>
        </FormField>
    );
};

export default DocumentUploadField;
