import { describe, expect, it } from 'vitest';

import { formatFileSize, getFileFormat } from './format-file-size';

describe('formatFileSize', () => {
  it('returns undefined for undefined or null input', () => {
    expect(formatFileSize(undefined)).toBeUndefined();
    expect(formatFileSize(null as unknown as undefined)).toBeUndefined();
  });

  it('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0b');
  });

  it('formats bytes below one kilobyte', () => {
    expect(formatFileSize(512)).toBe('512b');
    expect(formatFileSize(1023)).toBe('1023b');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1kb');
    expect(formatFileSize(2048)).toBe('2kb');
  });

  it('formats megabytes with one decimal', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0mb');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5mb');
  });
});

describe('getFileFormat', () => {
  it('returns undefined for undefined input', () => {
    expect(getFileFormat(undefined)).toBeUndefined();
  });

  it('returns the uppercased extension', () => {
    expect(getFileFormat('report.pdf')).toBe('PDF');
    expect(getFileFormat('image.JPG')).toBe('JPG');
  });

  it('strips query and hash before reading the extension', () => {
    expect(getFileFormat('https://example.com/a/report.docx?token=1')).toBe(
      'DOCX'
    );
    expect(getFileFormat('report.xlsx#section')).toBe('XLSX');
  });

  it('returns undefined when there is no extension', () => {
    expect(getFileFormat('report')).toBeUndefined();
    expect(getFileFormat('report.')).toBeUndefined();
  });
});
