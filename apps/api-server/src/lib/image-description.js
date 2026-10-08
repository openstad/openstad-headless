const MAX_IMAGE_DESCRIPTION_LENGTH = 500;

function assertImageDescriptionsWithinLimit(images) {
  if (!Array.isArray(images)) return;

  images.forEach((image) => {
    const description = image && image.description;
    if (
      typeof description === 'string' &&
      description.length > MAX_IMAGE_DESCRIPTION_LENGTH
    ) {
      throw new Error(
        `Opmerking bij een afbeelding mag maximaal ${MAX_IMAGE_DESCRIPTION_LENGTH} tekens zijn`
      );
    }
  });
}

module.exports = {
  MAX_IMAGE_DESCRIPTION_LENGTH,
  assertImageDescriptionsWithinLimit,
};
