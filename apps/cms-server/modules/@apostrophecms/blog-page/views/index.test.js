import path from 'path';
import { describe, expect, it } from 'vitest';

const { renderTemplate } = require('../../../../test-helpers/render-template');

const TEMPLATE_PATH = path.join(__dirname, 'index.html');

describe('blog-page index.html', () => {
  it('shows the empty-state message when there are no pieces', () => {
    const output = renderTemplate(TEMPLATE_PATH, {
      data: {
        page: { title: 'Nieuws' },
        pieces: [],
        currentPage: 1,
        totalPages: 1,
        url: '/nieuws',
      },
    });

    expect(output).toContain('Er zijn nog geen nieuwsberichten.');
    expect(output).not.toContain('news-card');
  });

  it('renders the pieces and no empty-state message when there are posts', () => {
    const output = renderTemplate(TEMPLATE_PATH, {
      data: {
        page: { title: 'Nieuws' },
        pieces: [
          {
            _url: '/nieuws/eerste-bericht',
            title: 'Eerste bericht',
            summary: 'Een samenvatting',
            publishedAt: '2026-01-01',
            image: null,
          },
        ],
        currentPage: 1,
        totalPages: 1,
        url: '/nieuws',
      },
    });

    expect(output).not.toContain('Er zijn nog geen nieuwsberichten.');
    expect(output).toContain('news-card');
    expect(output).toContain('Eerste bericht');
  });
});
