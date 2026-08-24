import path from 'path';
import { describe, expect, it } from 'vitest';

const { renderTemplate } = require('../../../test-helpers/render-template');

const TEMPLATE_PATH = path.join(__dirname, 'widget.html');

describe('openstad-blog-post-widget widget.html', () => {
  it('shows the empty-state message when there are no related posts', () => {
    const output = renderTemplate(TEMPLATE_PATH, {
      data: {
        widget: {
          title: 'Gerelateerde berichten',
          relatedPosts: [],
          enableCarousel: false,
        },
      },
    });

    expect(output).toContain('Er zijn nog geen nieuwsberichten.');
    expect(output).not.toContain('news-card');
    expect(output).not.toContain('carousel-controls');
  });

  it('shows the empty-state message and hides carousel controls when enabled but empty', () => {
    const output = renderTemplate(TEMPLATE_PATH, {
      data: {
        widget: {
          title: 'Gerelateerde berichten',
          relatedPosts: [],
          enableCarousel: true,
        },
      },
    });

    expect(output).toContain('Er zijn nog geen nieuwsberichten.');
    expect(output).not.toContain('carousel-controls');
    expect(output).not.toContain('carousel-dots');
  });

  it('renders the posts and no empty-state message when there are related posts', () => {
    const output = renderTemplate(TEMPLATE_PATH, {
      data: {
        widget: {
          title: 'Gerelateerde berichten',
          relatedPosts: [
            {
              _url: '/nieuws/eerste-bericht',
              title: 'Eerste bericht',
              summary: 'Een samenvatting',
              publishedAt: '2026-01-01',
              image: null,
            },
          ],
          enableCarousel: false,
          highlightedPost: [],
        },
      },
    });

    expect(output).not.toContain('Er zijn nog geen nieuwsberichten.');
    expect(output).toContain('news-card');
    expect(output).toContain('Eerste bericht');
  });
});
