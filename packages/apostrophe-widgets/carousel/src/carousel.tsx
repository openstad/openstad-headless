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

interface Item {
  images: string;
}

function Carousel({ images }: Item) {
  const image = JSON.parse(images);

  console.log(image)

  return (
    <div className='carousel'>
      <Slider
        items={image.items.length > 0 ? image.items : []}
        itemRenderer={(i) => (
          i._image[0].attachment !== undefined ? (
            <Image
              src={i._image[0].attachment?._urls.full}
              alt={i._image[0].alt || ''}
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