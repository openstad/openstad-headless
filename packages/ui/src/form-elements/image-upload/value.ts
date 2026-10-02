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
    if (Object.prototype.hasOwnProperty.call(descriptions, image.url)) {
      value.description = descriptions[image.url];
    }
    return value;
  });

  for (let i = 0; i < mockImages.length; i++) {
    const mockImage = mockImages[i];
    const value: ImageValue = {
      name: mockImage.options.file.name,
      url: mockImage.source,
    };

    if (Object.prototype.hasOwnProperty.call(descriptions, mockImage.source)) {
      value.description = descriptions[mockImage.source];
    } else if (mockImage.description !== undefined) {
      value.description = mockImage.description;
    }

    images.push(value);
  }

  return images;
}

export type DescriptionEntry = { url: string; name: string };

export function toDescriptionEntries(
  mockImages: MockImageFile[],
  uploadedImages: UploadedImage[],
  localFileNames: string[] = []
): DescriptionEntry[] {
  const newestUploadFirst = [...uploadedImages].reverse();

  return [
    ...newestUploadFirst.map((image) => ({
      url: image.url,
      name:
        localFileNames.find(
          (fileName) => toUploadedImageName(fileName) === image.name
        ) ?? image.name,
    })),
    ...mockImages.map((mockImage) => ({
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
  delete next[url];
  return next;
}

export function toUploadedImageName(fileName: string): string {
  return fileName.replace(/[^a-z0-9_\-]/gi, '_').replace(/_+/g, '_');
}
