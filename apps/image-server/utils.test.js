import { expect, test } from 'vitest';

import { sanitizeFileName } from './utils';

test('sanitize file names', () => {
  expect(sanitizeFileName('my file@name!.txt')).toBe('my_file_name_txt');
  expect(sanitizeFileName('hello/world\\test')).toBe('hello_world_test');
  expect(sanitizeFileName('123-abc_DEF')).toBe('123-abc_DEF');
  expect(sanitizeFileName('$$$weird__name###')).toBe('_weird_name_');
});
