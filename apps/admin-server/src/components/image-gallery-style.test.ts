import { describe, expect, it } from 'vitest';

import { imageGalleryCss } from './image-gallery-style';

describe('imageGalleryCss', () => {
  it('shows tile buttons on keyboard focus', () => {
    expect(imageGalleryCss).toMatch(
      /\.image-gallery\.tile:focus-within > \*:not\(\.image-container\) \{\s*opacity: 1;/
    );
  });

  it('still shows tile buttons on hover', () => {
    expect(imageGalleryCss).toMatch(
      /\.image-gallery\.tile:hover > \*:not\(\.image-container\) \{\s*opacity: 1;/
    );
  });
});
