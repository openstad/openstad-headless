import React, { FC, useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
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
import './document-upload.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import {Spacer} from "../../spacer";
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
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
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
    showMoreInfo = false,
    moreInfoButton = 'Meer informatie',
    moreInfoContent = '',
   infoImage = '',
    ...props
}) => {
    const randomID =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const [documents, setDocuments] = useState<FilePondFile[]>([]);
    const [uploadedDocuments, setUploadedDocuments] = useState<{ name: string, url: string }[]>([]);

    const acceptAttribute = allowedTypes
        ? allowedTypes
        : "";

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    useEffect(() => {
        const allDocuments = [];

        if (documents.length > 0 && uploadedDocuments.length > 0) {
            for (let i = 0; i < documents.length; i++) {
                const file = documents[i].file;
                if (file && file.name) {
                    let fileInUploadedDocuments = uploadedDocuments.find(o => o.name === file.name);

                    if (fileInUploadedDocuments) {
                        allDocuments.push(fileInUploadedDocuments);
                    }
                }
            }
        }

        if (onChange) {
            onChange({
                name: fieldKey,
                value: allDocuments,
            });
        }
    }, [documents.length, uploadedDocuments.length]);

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
            const span = document.querySelectorAll('.filepond--drop-label > label > span');
            label.forEach((item: any) => {
                item.setAttribute('aria-hidden', 'false');
            });
            span.forEach((item: any) => {
                item.removeAttribute('tabindex');
            });
        });
    }, []);

    return (
        <FormField type="text">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={randomID}>{title}</FormLabel>
            </Paragraph>
            {description &&
              <FormFieldDescription dangerouslySetInnerHTML={{__html: description}} />
            }
            {showMoreInfo && (
                <AccordionProvider
                    sections={[
                        {
                            body: <HtmlContent html={moreInfoContent} />,
                            expanded: undefined,
                            label: moreInfoButton,
                        }
                    ]}
                />
            )}

            {infoImage && (
                <figure className="info-image-container">
                    <img src={infoImage} alt=""/>
                    <Spacer size={.5} />
                </figure>
            )}

            <div className="utrecht-form-field__input">
                <FilePond
                    files={documents.map(file => file.file)}
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
                    id={randomID}
                    required={fieldRequired}
                    disabled={disabled}
                    acceptedFileTypes={typeof acceptAttribute === 'string' ? [acceptAttribute] : acceptAttribute}
                    beforeAddFile={(fileItem) => {
                        return new Promise<boolean>((resolve, reject) => {
                            const forbiddenCharsRegex = /[\\/:\*\?"<>\|]/;
                            const fileName = fileItem.file.name;
                            const forbiddenChar = fileName.match(forbiddenCharsRegex);

                            if (forbiddenChar) {
                                const forbiddenCharName = forbiddenChar[0];
                                const errorMessage = `Bestandsnaam mag het teken "${forbiddenCharName}" niet bevatten.`;
                                reject(errorMessage);
                            } else {
                                resolve(true);
                            }
                        }).catch(error => {
                            toast.error(error, { position: 'bottom-center' });
                            return false;
                        });
                    }}
                    {...filePondSettings}
                />

                <Toaster />
            </div>
        </FormField>
    );
};

export default DocumentUploadField;
