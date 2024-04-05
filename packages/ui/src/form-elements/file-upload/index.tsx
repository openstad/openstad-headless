import React, { FC, useEffect, useState } from "react";
import {
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
} from "@utrecht/component-library-react";

import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const filePondSettings = {
    labelIdle: "Sleep afbeelding(en) naar deze plek of <span class='filepond--label-action'>klik hier</span>",
    labelInvalidField: 'Veld bevat ongeldige bestanden',
    labelFileWaitingForSize: 'Wachtend op grootte',
    labelFileSizeNotAvailable: 'Grootte niet beschikbaar',
    labelFileCountSingular: 'Bestand in lijst',
    labelFileCountPlural: 'Bestanden in lijst',
    labelFileLoading: 'Laden',
    labelFileAdded: 'Toegevoegd',
    labelFileLoadError: 'Fout bij het uploaden',
    labelFileRemoved: 'Verwijderd',
    labelFileRemoveError: 'Fout bij het verwijderen',
    labelFileProcessing: 'Uploaden',
    labelFileProcessingComplete: 'Afbeelding geladen',
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
    acceptedFileTypes: ['image/*'],
    allowFileSizeValidation: true,
    maxFileSize: '8mb',
    name: 'image',
};


export type FileUploadProps = {
    title: string;
    description?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    allowedTypes?: string;
    disabled?: boolean;
    multiple?: boolean;
    onChange?: (e: {name: string, value: string | string[] | []}) => void;
    imageUrl?: string;
}

const FileUploadField: FC<FileUploadProps> = ({
    title,
    description,
    fieldKey,
    fieldRequired = false,
    multiple = false,
    onChange,
    allowedTypes = "",
    disabled = false,
    ...props
}) => {
    const randomID =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const [files, setFiles] = useState<string[]>([]);
    const [pondFiles, setPondFiles] = useState([])


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
        const uploadedFiles = event.target.files;
        const filesArray = [];

        if (uploadedFiles) {
            if (uploadedFiles.length > 0) {
                for (const i in uploadedFiles) {
                    if (uploadedFiles[i] instanceof File) {
                        filesArray.push(uploadedFiles[i]);
                    }
                }
            }
        }

        uploadImages(filesArray).then((urlArray) => {
            setFiles(urlArray as string[]);
        });
    };

    const acceptAttribute = allowedTypes
        ? allowedTypes
        : "";

    async function uploadImages(images: File[]): Promise<string[]> {
        const imageArray: string[] = [];
        const formData = new FormData();

        for (const image of images) {
            formData.append('image', image);
            formData.append('filename', image.name);
        }

        const response = await fetch('/api/openstad/api/image', {
            method: 'POST',
            body: formData,
        });

        const responseData = await response.json();

        for (const data of responseData) {
            imageArray.push(data.url);
        }

        return imageArray;
    }

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
                    multiple={multiple}
                    onChange={(e) => {
                        handleFileUpload(e);
                    }}
                    accept={acceptAttribute}
                    disabled={disabled}
                />

                <FilePond
                    files={pondFiles}
                    onupdatefiles={setPondFiles}
                    allowMultiple={multiple}
                    server={{
                        process: props?.imageUrl + '/images',
                        fetch: props?.imageUrl + '/image',
                        revert: null,
                    }}
                    {...filePondSettings}
                />

            </div>
        </FormField>
    );
};

export default FileUploadField;
