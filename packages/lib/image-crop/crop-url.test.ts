import { describe, expect, it } from 'vitest';

import { buildImageCropUrl, parseImageCropUrl } from './crop-url';

const plainUrl = 'https://img.example.com/image/foto-abc.jpg';
const croppedUrl = `${plainUrl}/:/cr=l:120,t:80,w:800,h:600`;

describe('parseImageCropUrl', () => {
  it('returns the url unchanged with a null crop for a plain url', () => {
    expect(parseImageCropUrl(plainUrl)).toEqual({
      baseUrl: plainUrl,
      crop: null,
    });
  });

  it('extracts the crop rect and base url from a cropped url', () => {
    expect(parseImageCropUrl(croppedUrl)).toEqual({
      baseUrl: plainUrl,
      crop: { x: 120, y: 80, width: 800, height: 600 },
    });
  });

  it('keeps other image-steam steps in the base url', () => {
    const resizedUrl = `${plainUrl}/:/rs=w:500`;
    expect(parseImageCropUrl(resizedUrl)).toEqual({
      baseUrl: resizedUrl,
      crop: null,
    });
  });
});

describe('buildImageCropUrl', () => {
  it('appends a crop step to a plain url', () => {
    expect(
      buildImageCropUrl(plainUrl, { x: 120, y: 80, width: 800, height: 600 })
    ).toBe(croppedUrl);
  });

  it('round-trips through parseImageCropUrl', () => {
    const crop = { x: 10, y: 20, width: 300, height: 400 };
    expect(parseImageCropUrl(buildImageCropUrl(plainUrl, crop))).toEqual({
      baseUrl: plainUrl,
      crop,
    });
  });

  it('replaces the crop step of an already cropped url', () => {
    expect(
      buildImageCropUrl(croppedUrl, { x: 1, y: 2, width: 3, height: 4 })
    ).toBe(`${plainUrl}/:/cr=l:1,t:2,w:3,h:4`);
  });

  it('appends the crop step after other image-steam steps', () => {
    const resizedUrl = `${plainUrl}/:/rs=w:500`;
    expect(
      buildImageCropUrl(resizedUrl, { x: 1, y: 2, width: 3, height: 4 })
    ).toBe(`${resizedUrl}/:/cr=l:1,t:2,w:3,h:4`);
  });

  it('clamps negative offsets to zero', () => {
    expect(
      buildImageCropUrl(plainUrl, { x: -10, y: -5, width: 300, height: 400 })
    ).toBe(`${plainUrl}/:/cr=l:0,t:0,w:300,h:400`);
  });

  it('clamps zero and negative dimensions to one', () => {
    expect(
      buildImageCropUrl(plainUrl, { x: 0, y: 0, width: 0, height: -20 })
    ).toBe(`${plainUrl}/:/cr=l:0,t:0,w:1,h:1`);
  });

  it('rounds fractional values', () => {
    expect(
      buildImageCropUrl(plainUrl, {
        x: 120.4,
        y: 80.6,
        width: 800.5,
        height: 599.4,
      })
    ).toBe(`${plainUrl}/:/cr=l:120,t:81,w:801,h:599`);
  });
});
