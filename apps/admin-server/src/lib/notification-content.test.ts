import { describe, expect, it } from 'vitest';

import { resolveInheritedStyling } from './notification-content';

const global = {
  logo: 'https://x.nl/global.png',
  primaryColor: '#363636',
  backgroundColor: '#f6f6f7',
  textColor: '#555555',
};

describe('resolveInheritedStyling', () => {
  it('takes the global value for every field the project left empty', () => {
    expect(
      resolveInheritedStyling(
        { logo: '', primaryColor: '', backgroundColor: '', textColor: '' },
        global
      )
    ).toEqual(global);
  });

  it('keeps the project value where it has one', () => {
    const resolved = resolveInheritedStyling(
      { primaryColor: '#ff0000', logo: '' },
      global
    );
    expect(resolved.primaryColor).toBe('#ff0000');
    expect(resolved.logo).toBe(global.logo);
  });

  // Per field, not per object: a project that only set one colour still inherits the rest.
  it('mixes the two sources field by field', () => {
    const resolved = resolveInheritedStyling({ textColor: '#111111' }, global);
    expect(resolved).toEqual({ ...global, textColor: '#111111' });
  });

  it('returns empty fields when neither side has a value', () => {
    expect(resolveInheritedStyling(undefined, undefined)).toEqual({
      logo: '',
      primaryColor: '',
      backgroundColor: '',
      textColor: '',
    });
  });

  it('tolerates null on both sides', () => {
    expect(resolveInheritedStyling(null, global)).toEqual(global);
  });
});
