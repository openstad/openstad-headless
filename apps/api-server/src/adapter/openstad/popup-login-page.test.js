import { describe, expect, it } from 'vitest';

import { popupLoginPage } from './popup-login-page.js';

const page = (overrides = {}) =>
  popupLoginPage({
    origin: 'https://site.example.com',
    projectId: 7,
    jwt: 'jwt-7',
    fallbackUrl: 'https://site.example.com/page?openstadlogintoken=jwt-7',
    ...overrides,
  });

const scriptBody = (html) =>
  html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));

describe('popupLoginPage', () => {
  it('posts the message to the validated origin only', () => {
    const html = page();

    expect(html).toContain('"https://site.example.com");');
    expect(html).not.toContain("'*'");
    expect(html).not.toContain('"*"');
  });

  it('includes the project id and jwt in the message', () => {
    expect(page()).toContain(
      '{"type":"openstad-login","projectId":7,"jwt":"jwt-7"}'
    );
  });

  it('redirects to the fallback url without an opener', () => {
    expect(page()).toContain(
      'window.location.replace("https://site.example.com/page?openstadlogintoken=jwt-7");'
    );
  });

  it('escapes values that try to close the script tag', () => {
    const html = page({
      jwt: '</script><script>alert(1)</script>',
      fallbackUrl: 'https://site.example.com/</script>',
    });

    expect(scriptBody(html)).not.toContain('</script');
    expect(scriptBody(html)).toContain('\\u003c/script>');
  });
});
