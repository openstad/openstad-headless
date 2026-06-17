import {
  AccordionProvider,
  Paragraph,
  Strong,
} from '@utrecht/component-library-react';
import React, { useState } from 'react';

import { Carousel } from '../carousel';
import { Lightbox } from '../lightbox';
import { Spacer } from '../spacer';
import './index.css';

type ImageType = {
  url: string;
  imageAlt?: string;
  imageDescription?: string;
};

type InfoImageProps = {
  imageFallback?: string;
  imageAltFallback?: string;
  imageDescriptionFallback?: string;
  images?: ImageType[];
  createImageSlider?: boolean;
  addSpacer?: boolean;
  imageClickable?: boolean;
};

const InfoImage = ({
  imageFallback = '',
  imageAltFallback = '',
  imageDescriptionFallback = '',
  images = [],
  createImageSlider = false,
  addSpacer = false,
  imageClickable = false,
}: InfoImageProps) => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string | undefined>(undefined);

  let imageArray: ImageType[] = images && images.length > 0 ? images : [];
  if (!imageArray.length && imageFallback) {
    imageArray = [
      {
        url: imageFallback,
        imageAlt: imageAltFallback,
        imageDescription: imageDescriptionFallback,
      },
    ];
  }

  const renderImage = (
    image: string,
    imageAlt?: string,
    imageDescription?: string
  ) => (
    <figure className="info-image-container">
      <img
        src={image}
        alt={imageAlt}
        onClick={
          imageClickable
            ? () => {
                setLightboxSrc(image);
                setLightboxAlt(imageAlt);
              }
            : undefined
        }
        className={imageClickable ? 'clickable-image' : undefined}
      />
      {imageDescription && <figcaption>{imageDescription}</figcaption>}
      {addSpacer && <Spacer size={0.5} />}
    </figure>
  );

  return (
    <>
      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          alt={lightboxAlt}
          onClose={() => setLightboxSrc(null)}
        />
      )}
      {createImageSlider && imageArray.length > 0 ? (
        <Carousel
          items={images}
          buttonText={{
            next: 'Volgende afbeelding',
            previous: 'Vorige afbeelding',
          }}
          pager={true}
          itemRenderer={(img) =>
            renderImage(img.url, img.imageAlt, img.imageDescription)
          }
        />
      ) : imageArray.length > 0 ? (
        imageArray.map((img) =>
          renderImage(img.url, img.imageAlt, img.imageDescription)
        )
      ) : null}
    </>
  );
};

export { InfoImage };
