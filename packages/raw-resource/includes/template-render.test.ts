import { describe, expect, test } from 'vitest';

import { renderRawTemplate } from './template-render';

const render = (rawInput: string, resource: any = {}, props: any = {}) =>
  renderRawTemplate({ rawInput, ...props } as any, resource, '', false);

// The template is admin-authored widget config and must survive untouched;
// everything substituted into it is user content and must be sanitized.
describe('renderRawTemplate', () => {
  test('keeps iframes from the admin template', () => {
    const template = '<iframe src="https://example.com/survey"></iframe>';
    expect(render(template)).toContain(
      '<iframe src="https://example.com/survey">'
    );
  });

  test('keeps inline event handlers from the admin template', () => {
    const template = '<button onclick="openstadLogout()">Uitloggen</button>';
    expect(render(template)).toBe(template);
  });

  test('strips scripts from substituted variables', () => {
    const out = render('<h1>{{title}}</h1>', {
      title: 'Hallo<script>alert(1)</script>',
    });
    expect(out).toBe('<h1>Hallo</h1>');
  });

  test('strips event handlers from substituted variables', () => {
    const out = render('<div>{{description}}</div>', {
      description: '<img src=x onerror=alert(1)>',
    });
    expect(out).not.toContain('onerror');
    expect(out).toContain('<img src="x">');
  });

  test('strips event handlers from modbreak descriptions', () => {
    const out = render('<div>{{modBreaksHtml}}</div>', {
      modBreaks: [
        {
          authorName: 'Moderator',
          description: '<p onclick="alert(1)">Modbreak</p>',
        },
      ],
    });
    expect(out).not.toContain('onclick');
    expect(out).toContain('<p>Modbreak</p>');
  });
});
