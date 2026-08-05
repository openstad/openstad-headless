import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AuthorBadge } from './author-badge';

const render = (props: any) => renderToStaticMarkup(<AuthorBadge {...props} />);

describe('AuthorBadge (comments widget)', () => {
  it('renders one staff badge when the author is staff', () => {
    const html = render({ isStaffMember: true, label: 'Webredactie' });
    expect(html).toContain('--isStaff');
    expect(html).toContain('Webredactie');
  });

  it('renders nothing for a non-staff / masked author (no enumeration signal)', () => {
    expect(render({ isStaffMember: false, label: 'Webredactie' })).toBe('');
    expect(render({ isStaffMember: undefined, label: 'Webredactie' })).toBe('');
  });

  it('renders nothing when the label is not configured by the widget', () => {
    expect(render({ isStaffMember: true, label: '' })).toBe('');
    expect(render({ isStaffMember: true, label: undefined })).toBe('');
  });
});
