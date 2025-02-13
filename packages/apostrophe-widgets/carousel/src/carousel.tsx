import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Carousel as Slider,
  Image,
  Spacer,
  Pill,
  IconButton, Icon,
} from '@openstad-headless/ui/src';
import "./carousel.css";

import "@utrecht/design-tokens/dist/root.css";
import { Paragraph } from "@utrecht/component-library-react";
interface Item {
  images: string;
  title?: string;
  size?: string;
  fit?: string;
  imagesize?: string;
}

function Carousel({ images, title, size = 'large', fit = 'cover', imagesize = 'full' }: Item) {
  const image = JSON.parse(images);
  const titleVisible = title === 'true' ? true : false;

  const getSize = (size: any) => {
    if (!size) {
      return ' ';
    }
    return ` --${size}`;
  }

  const getCover = (fit: any) => {
    if (!fit) {
      return ' ';
    }
    return ` --${fit}`;
  }

  return (
    <div className={`carousel${getSize(size)}${getCover(fit)}`}>
      <Slider
        items={image.items.length > 0 ? image.items : []}
        itemRenderer={(i) => (
          i._image.length > 0 ? (
            <Image
              src={i._image[0].attachment?._urls[imagesize] !== undefined ? i._image[0].attachment?._urls[imagesize] : i._image[0].attachment?._urls?.full}
              alt={i._image[0].alt || ''}
              imageFooter={titleVisible ? <Paragraph>{i._image[0].title}</Paragraph> : ''}
            />
          ): <></>
        )}
      />
    </div>
  );

};

Carousel.loadWidgetOnElement = function (this: any, container: HTMLElement, props: any) {
  const Component = this;

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }
};

export { Carousel };