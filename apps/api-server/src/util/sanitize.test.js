import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const sanitize = require('./sanitize');

const overlay =
  '<article class="intro"><div id="x" style="position:fixed;inset:0">hoi</div><p>tekst</p></article>';

describe('sanitize for submitted content', () => {
  for (const name of ['content', 'safeTags']) {
    it(`${name} removes style and id but keeps the markup`, () => {
      const result = sanitize[name](overlay);

      expect(result).not.toContain('style=');
      expect(result).not.toContain('id=');
      expect(result).toContain('<article class="intro">');
      expect(result).toContain('<p>tekst</p>');
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
});
