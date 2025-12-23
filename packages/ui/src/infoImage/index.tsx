import React from "react";
import {AccordionProvider, Paragraph, Strong} from "@utrecht/component-library-react";
import {Carousel} from "../carousel";
import {Spacer} from "../spacer";

type ImageType = {
  url: string;
  imageAlt?: string;
  imageDescription?: string;
}

type InfoImageProps = {
  imageFallback?: string;
  imageAltFallback?: string;
  imageDescriptionFallback?: string;
  images?: ImageType[];
  createImageSlider?: boolean;
  addSpacer?: boolean;
}

const InfoImage = ({
  imageFallback = '',
  imageAltFallback = '',
  imageDescriptionFallback = '',
  images = [],
  createImageSlider = false,
  addSpacer = false
}: InfoImageProps) => {
  let imageArray: ImageType[] = images && images.length > 0 ? images : [];
  if (!imageArray.length && imageFallback) {
    imageArray = [{
      url: imageFallback,
      imageAlt: imageAltFallback,
      imageDescription: imageDescriptionFallback
    }];
  }

  const renderImage = (
    image: string,
    imageAlt?: string,
    imageDescription?: string
  ) => (
    <figure className="info-image-container">
      <img src={image} alt={imageAlt} />
      {imageDescription && (
        <figcaption>{imageDescription}</figcaption>
      )}
      {addSpacer &&(
        <Spacer size={.5}/>
      )}
    </figure>
  )

  return createImageSlider && imageArray.length > 0 ? (
    <Carousel
      items={images}
      buttonText={{ next: 'Volgende afbeelding', previous: 'Vorige afbeelding' }}
      pager={true}
      itemRenderer={(img) => (
        renderImage(
          img.url,
          img.imageAlt,
          img.imageDescription
        )
      )}
    />
  ) : imageArray.length > 0 ? (
    imageArray.map((img) => (
      renderImage(
        img.url,
        img.imageAlt,
        img.imageDescription
      )
    ))
  ) : null
};

export { InfoImage };