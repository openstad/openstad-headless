import { parseImageCropUrl } from '@openstad-headless/lib/image-crop/crop-url';

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

export type UploadedImage = { name: string; url: string };

export type ImageValue = { name: string; url: string; description?: string };

export function toMockImages(overrideDefaultValue: unknown): MockImageFile[] {
  return overrideDefaultValue && Array.isArray(overrideDefaultValue)
    ? (
        overrideDefaultValue as {
          url: string;
          name: string;
          description?: string;
        }[]
      ).map((item) => {
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
          description: item.description,
        };
      })
    : [];
}

export function toDescriptionKey(url: string): string {
  return parseImageCropUrl(url).baseUrl;
}

export function buildImageValue({
  uploadedImages,
  mockImages,
  descriptions = {},
}: {
  uploadedImages: UploadedImage[];
  mockImages: MockImageFile[];
  descriptions?: Record<string, string>;
}): ImageValue[] {
  const images: ImageValue[] = uploadedImages.map((image) => {
    const value: ImageValue = { name: image.name, url: image.url };
    const key = toDescriptionKey(image.url);
    if (Object.prototype.hasOwnProperty.call(descriptions, key)) {
      value.description = descriptions[key];
    }
    return value;
  });

  for (let i = 0; i < mockImages.length; i++) {
    const mockImage = mockImages[i];
    const value: ImageValue = {
      name: mockImage.options.file.name,
      url: mockImage.source,
    };

    const key = toDescriptionKey(mockImage.source);
    if (Object.prototype.hasOwnProperty.call(descriptions, key)) {
      value.description = descriptions[key];
    } else if (mockImage.description !== undefined) {
      value.description = mockImage.description;
    }

    images.push(value);
  }

  return images;
}

export type DescriptionEntry = {
  kind: 'uploaded' | 'mock';
  index: number;
  url: string;
  name: string;
};

export function toDescriptionEntries(
  mockImages: MockImageFile[],
  uploadedImages: UploadedImage[],
  localFileNames: string[] = []
): DescriptionEntry[] {
  const newestUploadFirst = uploadedImages
    .map((image, index) => ({ image, index }))
    .reverse();

  return [
    ...newestUploadFirst.map(({ image, index }) => ({
      kind: 'uploaded' as const,
      index,
      url: image.url,
      name:
        localFileNames.find(
          (fileName) => toUploadedImageName(fileName) === image.name
        ) ?? image.name,
    })),
    ...mockImages.map((mockImage, index) => ({
      kind: 'mock' as const,
      index,
      url: mockImage.source,
      name: mockImage.options.file.name,
    })),
  ];
}

export function removeDescription(
  descriptions: Record<string, string>,
  url: string
): Record<string, string> {
  const next = { ...descriptions };
  delete next[toDescriptionKey(url)];
  return next;
}

export function toUploadedImageName(fileName: string): string {
  return fileName.replace(/[^a-z0-9_\-]/gi, '_').replace(/_+/g, '_');
}
