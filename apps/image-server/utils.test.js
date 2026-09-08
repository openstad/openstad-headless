import { expect, test } from 'vitest';

import {
  ALLOWED_IMAGE_EXTENSIONS,
  createFilename,
  isAllowedImageUpload,
  sanitizeFileName,
} from './utils';

test('sanitize file names', () => {
  expect(sanitizeFileName('my file@name!.txt')).toBe('my_file_name_txt');
  expect(sanitizeFileName('hello/world\\test')).toBe('hello_world_test');
  expect(sanitizeFileName('123-abc_DEF')).toBe('123-abc_DEF');
  expect(sanitizeFileName('$$$weird__name###')).toBe('_weird_name_');
});

test('createFilename keeps long file names within the filesystem limit', () => {
  const longName = `${'a'.repeat(250)}.pdf`;
  const result = createFilename(longName);

  expect(result.length).toBeLessThanOrEqual(255);
  expect(result.endsWith('.pdf')).toBe(true);
});

test('createFilename sanitizes forbidden characters in the base name and extension', () => {
  const withColon = createFilename('12:06 verslag.pdf');
  expect(withColon).toMatch(/^12_06_verslag-[0-9a-f-]{36}\.pdf$/);

  const withSlashInExtension = createFilename('rapport.p/df');
  expect(withSlashInExtension).toMatch(/^rapport-[0-9a-f-]{36}\.p_df$/);

  const withBackslash = createFilename('map\\bestand.docx');
  expect(withBackslash).toMatch(/^map_bestand-[0-9a-f-]{36}\.docx$/);

  const specialChars = createFilename('een *?"<>| naam.pdf');
  expect(specialChars).toMatch(/^een_naam-[0-9a-f-]{36}\.pdf$/);
});

test('the allowed image extensions do not include heic or heif', () => {
  expect(ALLOWED_IMAGE_EXTENSIONS).not.toContain('heic');
  expect(ALLOWED_IMAGE_EXTENSIONS).not.toContain('heif');
  expect(ALLOWED_IMAGE_EXTENSIONS).toContain('jpg');
});

test('isAllowedImageUpload accepts the supported image types', () => {
  expect(isAllowedImageUpload('foto.jpg', 'image/jpeg')).toBe(true);
  expect(isAllowedImageUpload('foto.JPEG', 'image/jpeg')).toBe(true);
  expect(isAllowedImageUpload('plaatje.png', 'image/png')).toBe(true);
  expect(isAllowedImageUpload('plaatje.webp', 'image/webp')).toBe(true);
  expect(isAllowedImageUpload('animatie.gif', 'image/gif')).toBe(true);
});

test('isAllowedImageUpload rejects heic and heif regardless of casing', () => {
  expect(isAllowedImageUpload('IMG_1234.heic', 'image/heic')).toBe(false);
  expect(isAllowedImageUpload('IMG_1234.HEIC', 'image/heic')).toBe(false);
  expect(isAllowedImageUpload('IMG_1234.heif', 'image/heif')).toBe(false);
});

test('isAllowedImageUpload rejects a heic mime type behind an allowed extension', () => {
  expect(isAllowedImageUpload('IMG_1234.jpg', 'image/heic')).toBe(false);
});

test('isAllowedImageUpload rejects an allowed extension behind an empty mime type', () => {
  expect(isAllowedImageUpload('IMG_1234.heic', '')).toBe(false);
  expect(isAllowedImageUpload('IMG_1234.heic', undefined)).toBe(false);
});

test('isAllowedImageUpload rejects names without a usable extension', () => {
  expect(isAllowedImageUpload('geen-extensie', 'image/jpeg')).toBe(false);
  expect(isAllowedImageUpload('', 'image/jpeg')).toBe(false);
  expect(isAllowedImageUpload(undefined, 'image/jpeg')).toBe(false);
});

test('isAllowedImageUpload rejects non image mime types', () => {
  expect(isAllowedImageUpload('script.jpg', 'application/javascript')).toBe(
    false
  );
});
