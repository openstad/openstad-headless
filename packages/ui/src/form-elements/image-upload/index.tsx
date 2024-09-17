import React, { FC, useEffect, useState } from "react";
import {
    AccordionProvider,
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
} from "@utrecht/component-library-react";

import { FilePond, registerPlugin } from 'react-filepond'
import { FilePondFile, FilePondErrorDescription } from 'filepond'
import 'filepond/dist/filepond.min.css'
import './image-upload.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import {Spacer} from "../../spacer";
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateType);

const filePondSettings = {
    labelIdle: "Upload hier uw bestand(en)",
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
    labelFileTypeNotAllowed: 'Bestandstype is niet toegestaan',
    allowFileSizeValidation: true,
    maxFileSize: '8mb',
    name: 'image',
    maxParallelUploads: 1
};

export type ImageUploadProps = {
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
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
}

const ImageUploadField: FC<ImageUploadProps> = ({
    title,
    description,
    fieldKey,
    fieldRequired = false,
    multiple = false,
    onChange,
    allowedTypes = ['image/*'],
    disabled = false,
    showMoreInfo = false,
    moreInfoButton = 'Meer informatie',
    moreInfoContent = '',
   infoImage = '',
    ...props
}) => {
    const randomID =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const [files, setImages] = useState<FilePondFile[]>([]);
    const [uploadedImages, setUploadedImages] = useState<{ name: string, url: string }[]>([]);

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    useEffect(() => {
        if (onChange) {
            onChange({
                name: fieldKey,
                value: uploadedImages,
            });
        }
    }, [uploadedImages.length, setImages, setUploadedImages]);

    const acceptAttribute = allowedTypes
        ? allowedTypes
        : "";


    function waitForElm(selector: any) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }



    useEffect(() => {
        waitForElm('.filepond--browser').then((elm: any) => {

            const label = document.querySelectorAll('.filepond--drop-label > label');
            label.forEach((item: any) => {
                item.setAttribute('aria-hidden', 'false');
            });
        });
    }, []);





    return (
        <FormField type="text">
            <Paragraph className="utrecht-form-field__label">
                {title}
            </Paragraph>
            <FormFieldDescription>{description}</FormFieldDescription>

            {showMoreInfo && (
                <>
                    <AccordionProvider
                        sections={[
                            {
                                headingLevel: 3,
                                body: <HtmlContent html={moreInfoContent} />,
                                expanded: undefined,
                                label: moreInfoButton,
                            }
                        ]}
                    />
                    <Spacer size={.5} />
                </>
            )}

            {infoImage && (
                <figure className="info-image-container">
                    <img src={infoImage} alt=""/>
                    <Spacer size={.5} />
                </figure>
            )}

            <div className="utrecht-form-field__input">
                <FilePond
                    files={files.map(file => file.file)}
                    onupdatefiles={(fileItems: FilePondFile[]) => {
                        setImages(fileItems);
                    }}
                    allowMultiple={multiple}
                    server={{
                        process: {
                            url: props?.imageUrl + '/images',
                            method: 'POST',
                            onload: (response: any) => {
                                const currentImages = [...uploadedImages];
                                currentImages.push(JSON.parse(response)[0]);

                                setUploadedImages(currentImages);

                                return JSON.stringify(currentImages); // Dit heeft echt geen nut, maar het lost wel de TS problemen op
                            },
                        },
                        fetch: props?.imageUrl + '/image',
                        revert: null,
                    }}
                    onremovefile={(error: FilePondErrorDescription | null, file: FilePondFile) => {
                        const fileName = file?.file?.name;
                        if (!!fileName) {
                            const updatedImages = uploadedImages.filter(item => item.name !== fileName);
                            setUploadedImages(updatedImages);
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

export default ImageUploadField;
