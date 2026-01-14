import React, { FC, useEffect, useState } from "react";
import {
    AccordionProvider,
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
} from "@utrecht/component-library-react";

import { FilePond, registerPlugin } from 'react-filepond'
import { FilePondFile, FilePondErrorDescription, FilePondInitialFile } from 'filepond'
import 'filepond/dist/filepond.min.css'
import './image-upload.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import {Spacer} from "../../spacer";
import DataStore from '@openstad-headless/data-store/src';
import { FormValue } from "@openstad-headless/form/src/form";
import {InfoImage} from "../../infoImage";
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

type MockImageFile = {
    source: string,
    options: {
        type: string,
        file: {
            name: string,
            size: number,
            type: string
        }
    }
}

export type ImageUploadProps = {
    title: string;
    overrideDefaultValue?: FormValue;
    description?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    allowedTypes?: string[];
    disabled?: boolean;
    multiple?: boolean;
    type?: string;
    onChange?: (e: { name: string; value: { name: string; url: string }[] }, triggerSetLastKey?: boolean) => void;
    imageUrl?: string;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    defaultValue?: string;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: { value: string; label: string }[];
    images?: Array<{
        url: string;
        name?: string;
        imageAlt?: string;
        imageDescription?: string;
    }>;
    createImageSlider?: boolean;
    imageClickable?: boolean;
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
    randomId = '',
    fieldInvalid = false,
    overrideDefaultValue = [],
    images = [],
    createImageSlider = false,
    imageClickable = false,
    ...props
}) => {
    const datastore = new DataStore({ props });

    const initialValue: MockImageFile[] = (overrideDefaultValue && Array.isArray(overrideDefaultValue))
      ? (overrideDefaultValue as { url: string; name: string }[]).map((item: {url: string, name: string}) => {
          return {
              source: item.url,
              options: {
                  type: 'local',
                  file: {
                      name: item.name,
                      size: 1,
                      type: '*',
                  },
              },
          }
      })
      : [];

    const [files, setImages] = useState<FilePondFile[]>([]);
    const [mockImages, setMockImages] = useState<MockImageFile[]>(initialValue);
    const [uploadedImages, setUploadedImages] = useState<{ name: string, url: string }[]>([]);

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    useEffect(() => {
        const images = [...uploadedImages];
        for (let i = 0; i < mockImages.length; i++) {
            const mockImage = mockImages[i];
            images.push({ name: mockImage.options.file.name, url: mockImage.source });
        }
        
        if (onChange) {
            onChange({
                name: fieldKey,
                value: images,
            });
        }
    }, [uploadedImages.length, mockImages.length, setImages, setUploadedImages]);

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
    
    const finalImages = Array.from( new Set( [...mockImages, ...files] ) );

    return (
        <FormField type="text">

            {title && (
                <Paragraph className="utrecht-form-field__label">
                    <FormLabel htmlFor={randomId} dangerouslySetInnerHTML={{ __html: title }} />
                </Paragraph>
            )}

            {description &&
                <FormFieldDescription dangerouslySetInnerHTML={{__html: description}} />
            }

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
                    <Spacer size={1.5} />
                </>
            )}

            {InfoImage({
                imageFallback: infoImage || '',
                images: images,
                createImageSlider: createImageSlider,
                addSpacer: !!infoImage,
                imageClickable: imageClickable
            })}

            <div className="utrecht-form-field__input">
                <FilePond
                    files={finalImages as File[] | FilePondInitialFile[]}
                    onupdatefiles={(fileItems: FilePondFile[]) => {
                        const imagesExceptMockedImages = fileItems?.map(img => {
                            const isMockedImages = mockImages?.find(mockImage => mockImage.options.file.name === img.file.name);
                            if (isMockedImages) {
                                return null;
                            }
                            return img;
                        }).filter(img => img !== null) as FilePondFile[];
                        
                        setImages(imagesExceptMockedImages);
                    }}
                    allowMultiple={multiple}
                    server={{
                        process: {
                            url: props?.imageUrl + '/images',
                            method: 'POST',
                            headers: {
                                'Authorization': 'Bearer ' + datastore.api?.currentUserJWT,
                            },
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
                           const uploadImageFileName = fileName.replace(/\./g, '_');
                           const fileIsInUploadedImages = uploadedImages.find(item => item.name === uploadImageFileName);

                           const fileIsInMockImages = mockImages.find(item => item.options.file.name === fileName);

                           if (fileIsInMockImages) {
                               const updatedMockImages = mockImages.filter(item => item.options.file.name !== fileName);
                               setMockImages(updatedMockImages);
                               return;
                           }

                           if (!fileIsInUploadedImages) return;

                           const updatedImages = uploadedImages.filter(item => item.name !== uploadImageFileName);
                           setUploadedImages(updatedImages);

                           const updatedFiles = files.filter(item => item.file.name !== fileName);
                           setImages(updatedFiles);
                        }
                    }}
                    id={randomId}
                    required={fieldRequired}
                    disabled={disabled}
                    acceptedFileTypes={typeof acceptAttribute === 'string' ? [acceptAttribute] : acceptAttribute}
                    aria-invalid={fieldInvalid}
                    aria-describedby={`${randomId}_error`}
                    {...filePondSettings}
                />

            </div>
        </FormField>
    );
};

export default ImageUploadField;
