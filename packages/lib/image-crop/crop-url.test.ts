import { describe, expect, it } from 'vitest';

import {
  buildImageCropUrl,
  buildImagePreviewUrl,
  parseImageCropUrl,
  withImageStep,
} from './crop-url';

const plainUrl = 'https://img.example.com/image/foto-abc.jpg';
const croppedUrl = `${plainUrl}/:/cr=l:0%25,t:12.5%25,w:100%25,h:75%25`;
const legacyPixelUrl = `${plainUrl}/:/cr=l:120,t:80,w:800,h:600`;

describe('parseImageCropUrl', () => {
  it('returns the url unchanged with no crop for a plain url', () => {
    expect(parseImageCropUrl(plainUrl)).toEqual({
      baseUrl: plainUrl,
      crop: null,
      hasCrop: false,
    });
  });

  it('extracts the percentage crop rect and base url from a cropped url', () => {
    expect(parseImageCropUrl(croppedUrl)).toEqual({
      baseUrl: plainUrl,
      crop: { x: 0, y: 12.5, width: 100, height: 75 },
      hasCrop: true,
    });
  });

  it('keeps other image-steam steps in the base url', () => {
    const resizedUrl = `${plainUrl}/:/rs=w:500`;
    expect(parseImageCropUrl(resizedUrl)).toEqual({
      baseUrl: resizedUrl,
      crop: null,
      hasCrop: false,
    });
  });

  it('strips the crop step but keeps preceding steps in the base url', () => {
    const url = `${plainUrl}/:/rs=w:500/cr=l:0%25,t:0%25,w:50%25,h:50%25`;
    expect(parseImageCropUrl(url)).toEqual({
      baseUrl: `${plainUrl}/:/rs=w:500`,
      crop: { x: 0, y: 0, width: 50, height: 50 },
      hasCrop: true,
    });
  });

  it('reports a legacy pixel crop as cropped without returning coordinates', () => {
    expect(parseImageCropUrl(legacyPixelUrl)).toEqual({
      baseUrl: plainUrl,
      crop: null,
      hasCrop: true,
    });
  });

  it('accepts a literal percent sign as well as the encoded form', () => {
    const literal = `${plainUrl}/:/cr=l:0%,t:12.5%,w:100%,h:75%`;
    expect(parseImageCropUrl(literal)).toEqual({
      baseUrl: plainUrl,
      crop: { x: 0, y: 12.5, width: 100, height: 75 },
      hasCrop: true,
    });
  });
});

describe('buildImageCropUrl', () => {
  it('appends an encoded percentage crop step to a plain url', () => {
    expect(
      buildImageCropUrl(plainUrl, { x: 0, y: 12.5, width: 100, height: 75 })
    ).toBe(croppedUrl);
  });

  it('round-trips through parseImageCropUrl', () => {
    const crop = { x: 10.25, y: 20.5, width: 30.125, height: 40 };
    expect(parseImageCropUrl(buildImageCropUrl(plainUrl, crop))).toEqual({
      baseUrl: plainUrl,
      crop,
      hasCrop: true,
    });
  });

  it('replaces the crop step of an already cropped url', () => {
    expect(
      buildImageCropUrl(croppedUrl, { x: 1, y: 2, width: 3, height: 4 })
    ).toBe(`${plainUrl}/:/cr=l:1%25,t:2%25,w:3%25,h:4%25`);
  });

  it('replaces a legacy pixel crop step', () => {
    expect(
      buildImageCropUrl(legacyPixelUrl, { x: 1, y: 2, width: 3, height: 4 })
    ).toBe(`${plainUrl}/:/cr=l:1%25,t:2%25,w:3%25,h:4%25`);
  });

  it('adds the crop step to an existing step chain instead of opening a new one', () => {
    const resizedUrl = `${plainUrl}/:/rs=w:500`;
    expect(
      buildImageCropUrl(resizedUrl, { x: 1, y: 2, width: 3, height: 4 })
    ).toBe(`${resizedUrl}/cr=l:1%25,t:2%25,w:3%25,h:4%25`);
  });

  it('clamps negative offsets to zero', () => {
    expect(
      buildImageCropUrl(plainUrl, { x: -10, y: -5, width: 50, height: 50 })
    ).toBe(`${plainUrl}/:/cr=l:0%25,t:0%25,w:50%25,h:50%25`);
  });

  it('clamps offsets so the crop stays inside the image', () => {
    expect(
      buildImageCropUrl(plainUrl, { x: 80, y: 90, width: 50, height: 40 })
    ).toBe(`${plainUrl}/:/cr=l:50%25,t:60%25,w:50%25,h:40%25`);
  });

  it('clamps oversized dimensions to the full image', () => {
    expect(
      buildImageCropUrl(plainUrl, { x: 0, y: 0, width: 140, height: 200 })
    ).toBe(`${plainUrl}/:/cr=l:0%25,t:0%25,w:100%25,h:100%25`);
  });

  it('raises zero and negative dimensions to the minimum', () => {
    expect(
      buildImageCropUrl(plainUrl, { x: 0, y: 0, width: 0, height: -20 })
    ).toBe(`${plainUrl}/:/cr=l:0%25,t:0%25,w:0.01%25,h:0.01%25`);
  });

  it('rounds to four decimals and drops trailing zeroes', () => {
    expect(
      buildImageCropUrl(plainUrl, {
        x: 12.000001,
        y: 33.333333,
        width: 66.666666,
        height: 20.5,
      })
    ).toBe(`${plainUrl}/:/cr=l:12%25,t:33.3333%25,w:66.6667%25,h:20.5%25`);
  });
});

describe('withImageStep', () => {
  it('opens a step chain on a plain url', () => {
    expect(withImageStep(plainUrl, 'rs=w:480')).toBe(`${plainUrl}/:/rs=w:480`);
  });

  it('appends to an existing step chain', () => {
    expect(withImageStep(`${plainUrl}/:/rs=w:480`, 'fm=f:webp')).toBe(
      `${plainUrl}/:/rs=w:480/fm=f:webp`
    );
  });
});

describe('buildImagePreviewUrl', () => {
  it('bounds a plain url to the given size', () => {
    expect(buildImagePreviewUrl(plainUrl, 1600)).toBe(
      `${plainUrl}/:/rs=w:1600,h:1600`
    );
  });

  it('keeps the crop step and resizes the result', () => {
    expect(buildImagePreviewUrl(croppedUrl, 480)).toBe(
      `${croppedUrl}/rs=w:480,h:480`
    );
  });

  it('drops a legacy pixel crop step so the preview shows the full image', () => {
    expect(buildImagePreviewUrl(legacyPixelUrl, 480)).toBe(
      `${plainUrl}/:/rs=w:480,h:480`
    );
  });
});
