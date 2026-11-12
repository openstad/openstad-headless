export type MockImageFile = {
    source: string;
    options: {
        type: string;
        file: {
            name: string;
            size: number;
            type: string;
        };
    };
    description?: string;
};
export type UploadedImage = {
    name: string;
    url: string;
};
export type ImageValue = {
    name: string;
    url: string;
    description?: string;
};
export declare function toMockImages(overrideDefaultValue: unknown): MockImageFile[];
export declare function toDescriptionKey(url: string): string;
export declare function buildImageValue({ uploadedImages, mockImages, descriptions, }: {
    uploadedImages: UploadedImage[];
    mockImages: MockImageFile[];
    descriptions?: Record<string, string>;
}): ImageValue[];
export type DescriptionEntry = {
    kind: 'uploaded' | 'mock';
    index: number;
    url: string;
    name: string;
};
export declare function toDescriptionEntries(mockImages: MockImageFile[], uploadedImages: UploadedImage[], localFileNames?: string[]): DescriptionEntry[];
export declare function removeDescription(descriptions: Record<string, string>, url: string): Record<string, string>;
export declare function toUploadedImageName(fileName: string): string;
