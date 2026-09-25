// Pure helpers for image-upload/index.tsx, split out so they can be unit tested
// without rendering the component (this repo has no jsdom / @testing-library).

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
  // The remark this image already had (e.g. one an admin wrote), carried
  // through from overrideDefaultValue so it is not lost on a round-trip.
  description?: string;
};

export type UploadedImage = { name: string; url: string };

export type ImageValue = { name: string; url: string; description?: string };

// Turns saved form values (e.g. from a previously submitted resource) into
// FilePond mock file entries so existing uploads show up pre-loaded.
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

// Combines newly uploaded images with pre-existing (mock) images into the
// value emitted through onChange, attaching each image's remark.
//
// `descriptions` is keyed by image url and holds only what the submitter
// actually typed in this session. A key's PRESENCE in the map -- not its
// truthiness -- decides whether the submitter's edit wins, so clearing a
// remark (typing it down to an empty string) is not confused with never
// having touched it.
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
      // No edit this session -- keep the description this image already had.
      value.description = mockImage.description;
    }

    images.push(value);
  }

  return images;
}

export type DescriptionEntry = { url: string; name: string };

// Returns image entries in the order FilePond shows its thumbnails after a
// browsed upload (measured in form-elements.cy.tsx's "remark order" suite):
// newest upload on top, existing images below. `uploadedImages` is
// chronological (oldest pushed first), so it's reversed here.
//
// A drag-and-drop upload measured the OPPOSITE order (existing first,
// dropped file last), and there's no per-image record of how it was added,
// so this can't also match the drop case -- the file name in each remark
// box's label is the fallback for matching a remark to the right photo then.
export function toDescriptionEntries(
  mockImages: MockImageFile[],
  uploadedImages: UploadedImage[]
): DescriptionEntry[] {
  const newestUploadFirst = [...uploadedImages].reverse();

  return [
    ...newestUploadFirst.map((image) => ({
      url: image.url,
      name: image.name,
    })),
    ...mockImages.map((mockImage) => ({
      url: mockImage.source,
      name: mockImage.options.file.name,
    })),
  ];
}

// Drops a single image's remark from the descriptions map, e.g. when the
// image itself is removed, without touching any other image's remark.
export function removeDescription(
  descriptions: Record<string, string>,
  url: string
): Record<string, string> {
  const next = { ...descriptions };
  delete next[url];
  return next;
}

// Converts a local file name into the `name` the image server returns for it,
// using the same rule as sanitizeFileName in apps/image-server/utils.js. The
// remove handler needs this to find a FilePond file in uploadedImages -- only
// replacing dots missed names with spaces or other characters, so the photo
// (and its remark) stayed in the form after the submitter removed it.
export function toUploadedImageName(fileName: string): string {
  return fileName.replace(/[^a-z0-9_\-]/gi, '_').replace(/_+/g, '_');
}
