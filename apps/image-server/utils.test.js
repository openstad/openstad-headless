import { expect, test } from 'vitest';

import { createFilename, sanitizeFileName } from './utils';

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
