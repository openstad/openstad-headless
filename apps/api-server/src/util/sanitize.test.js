import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const sanitize = require('./sanitize');

const overlay =
  '<article class="intro"><div id="x" style="position:fixed;inset:0">hoi</div><p>tekst</p></article>';

const youtubeEmbed =
  '<iframe src="https://www.youtube.com/embed/zB8YffmXkmQ" title="Video"></iframe>';

describe('sanitize for submitted content', () => {
  for (const name of ['content', 'safeTags']) {
    it(`${name} removes style and id but keeps the markup`, () => {
      const result = sanitize[name](overlay);

      expect(result).not.toContain('style=');
      expect(result).not.toContain('id=');
      expect(result).toContain('<article class="intro">');
      expect(result).toContain('<p>tekst</p>');
    });

    it(`${name} removes iframes`, () => {
      expect(sanitize[name](youtubeEmbed)).not.toContain('<iframe');
    });
  }
});

describe('sanitize for raw widget code', () => {
  it('keeps style and id', () => {
    const result = sanitize.rawInput(overlay);

    expect(result).toContain('id="x"');
    expect(result).toContain('style="position:fixed;inset:0"');
  });

  it('still removes scripts and event handlers', () => {
    const result = sanitize.rawInput(
      '<script>alert(1)</script><div onclick="alert(1)" style="color:red">hoi</div>'
    );

    expect(result).not.toContain('<script>');
    expect(result).not.toContain('onclick');
    expect(result).toContain('hoi');
  });

  it('still removes style tags with their content', () => {
    const result = sanitize.rawInput('<style>.x{color:red}</style><p>hoi</p>');

    expect(result).not.toContain('<style');
    expect(result).not.toContain('.x{');
    expect(result).toContain('hoi');
  });
});

describe('sanitize iframes in raw widget code', () => {
  for (const src of [
    'https://www.youtube.com/embed/zB8YffmXkmQ',
    'https://youtube.com/embed/zB8YffmXkmQ',
    'https://www.youtube-nocookie.com/embed/zB8YffmXkmQ',
    'https://player.vimeo.com/video/76979871',
  ]) {
    it(`keeps an iframe from ${src}`, () => {
      const result = sanitize.rawInput(`<iframe src="${src}"></iframe>`);

      expect(result).toContain(`<iframe src="${src}"`);
    });
  }

  it('keeps the embed attributes and removes event handlers', () => {
    const result = sanitize.rawInput(
      '<iframe src="https://www.youtube.com/embed/zB8YffmXkmQ" title="Video" width="560" height="315" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" style="width:100%" onload="alert(1)" allowfullscreen></iframe>'
    );

    expect(result).toContain('title="Video"');
    expect(result).toContain('width="560"');
    expect(result).toContain('height="315"');
    expect(result).toContain('allow="autoplay; encrypted-media"');
    expect(result).toContain(
      'referrerpolicy="strict-origin-when-cross-origin"'
    );
    expect(result).toContain('style="width:100%"');
    expect(result).toContain('allowfullscreen');
    expect(result).not.toContain('onload');
  });

  for (const iframe of [
    '<iframe src="https://evil.com/x"></iframe>',
    '<iframe src="https://youtube.com.evil.com/x"></iframe>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<iframe src="/relative"></iframe>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  ]) {
    it(`removes ${iframe}`, () => {
      const result = sanitize.rawInput(`${iframe}<p>hoi</p>`);

      expect(result).not.toContain('<iframe');
      expect(result).toContain('<p>hoi</p>');
    });
  }
});
