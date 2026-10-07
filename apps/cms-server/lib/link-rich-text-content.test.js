import { describe, expect, it, vi } from 'vitest';

const { linkRichTextContent } = require('./link-rich-text-content');

const buildApos = () => {
  const richText = {
    linkPermalinks: vi.fn((widget, content) =>
      content.replace('PERMALINK', 'https://example.com/page')
    ),
    linkImages: vi.fn((widget, content) =>
      content.replace('IMAGE_PLACEHOLDER', '/uploads/real.png')
    ),
  };
  return {
    richText,
    apos: { modules: { '@apostrophecms/rich-text-widget': richText } },
  };
};

const buildArea = (content) => ({
  items: [{ type: '@apostrophecms/rich-text', content, _relatedDocs: [] }],
});

describe('linkRichTextContent', () => {
  it('swaps image placeholders and permalinks for real URLs', () => {
    const { apos } = buildApos();
    const area = buildArea(
      '<a href="PERMALINK"></a><img src="IMAGE_PLACEHOLDER">'
    );

    expect(linkRichTextContent(apos, area)).toBe(
      '<a href="https://example.com/page"></a><img src="/uploads/real.png">'
    );
  });

  it('links permalinks first, then images, on the first item', () => {
    const { apos, richText } = buildApos();
    const area = buildArea('x');

    linkRichTextContent(apos, area);

    expect(richText.linkPermalinks.mock.calls[0][0]._relatedDocs).toBe(
      area.items[0]._relatedDocs
    );
    expect(richText.linkPermalinks.mock.invocationCallOrder[0]).toBeLessThan(
      richText.linkImages.mock.invocationCallOrder[0]
    );
  });

  it('returns an empty string for a missing area, empty items or missing content', () => {
    const { apos } = buildApos();

    expect(linkRichTextContent(apos, undefined)).toBe('');
    expect(linkRichTextContent(apos, {})).toBe('');
    expect(linkRichTextContent(apos, { items: [] })).toBe('');
    expect(linkRichTextContent(apos, { items: [{}] })).toBe('');
  });

  it('does not mutate the input area', () => {
    const { apos } = buildApos();
    const area = buildArea('<img src="IMAGE_PLACEHOLDER">');
    const before = JSON.stringify(area);

    linkRichTextContent(apos, area);

    expect(JSON.stringify(area)).toBe(before);
  });
});
