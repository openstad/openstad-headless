import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AuthorBadge } from './author-badge';

const labels = { adminLabel: 'Webredactie', editorLabel: 'Redactie' };
const render = (props: any) =>
  renderToStaticMarkup(<AuthorBadge {...labels} {...props} />);

describe('AuthorBadge (comments widget)', () => {
  it('renders the admin badge for an admin author', () => {
    const html = render({ staffRole: 'admin' });
    expect(html).toContain('--isAdmin');
    expect(html).toContain('Webredactie');
  });

  it('renders the editor badge for an editor author', () => {
    const html = render({ staffRole: 'editor' });
    expect(html).toContain('--isEditor');
    expect(html).toContain('Redactie');
  });

  it('renders nothing for a non-staff author (no enumeration signal)', () => {
    expect(render({ staffRole: null })).toBe('');
    expect(render({ staffRole: undefined })).toBe('');
    expect(render({ staffRole: 'member' })).toBe('');
    expect(render({ staffRole: 'moderator' })).toBe('');
  });

  it('renders nothing when the matching label is not configured', () => {
    expect(render({ staffRole: 'admin', adminLabel: '' })).toBe('');
    expect(render({ staffRole: 'admin', adminLabel: undefined })).toBe('');
    expect(render({ staffRole: 'editor', editorLabel: '' })).toBe('');
    expect(render({ staffRole: 'editor', editorLabel: undefined })).toBe('');
  });
});
