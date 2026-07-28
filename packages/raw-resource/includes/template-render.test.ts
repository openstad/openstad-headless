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

  test('escapes quotes in variables that land in an attribute', () => {
    const out = render('<a title="{{title}}" href="#">x</a>', {
      title: 'x" onmouseover="alert(1)',
    });
    expect(out).toBe(
      '<a title="x&quot; onmouseover=&quot;alert(1)" href="#">x</a>'
    );
  });

  test('keeps html in variables that land in element content', () => {
    const out = render('<div>{{description}}</div>', {
      description: '<p>Hallo <strong>daar</strong></p>',
    });
    expect(out).toBe('<div><p>Hallo <strong>daar</strong></p></div>');
  });

  test('does not treat a quoted > as the end of a tag', () => {
    const out = render('<a title="a>b" href="{{title}}">x</a>', {
      title: '" onmouseover="alert(1)',
    });
    expect(out).not.toContain('onmouseover="alert(1)"');
  });

  test('leaves template syntax inside user content inert', () => {
    const out = render('<h1>{{title}}</h1><p>{{summary}}</p>', {
      title: '{{summary}}',
      summary: 'geheim',
    });
    expect(out).toBe('<h1>{{summary}}</h1><p>geheim</p>');
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
