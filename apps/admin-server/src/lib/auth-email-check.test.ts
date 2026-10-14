import { describe, expect, it } from 'vitest';

import { emptiedAuthEmail, emptiedUserEmail } from './auth-email-check';

describe('emptiedAuthEmail', () => {
  it('stops a save that would empty a stored address', () => {
    expect(
      emptiedAuthEmail(
        { contactEmail: 'hulp@example.org' },
        { contactEmail: '' }
      )
    ).toBe(
      '"E-mailadres voor contact en hulpvragen" kan niet leeg worden opgeslagen. Vul een e-mailadres in.'
    );
    expect(
      emptiedAuthEmail({ fromEmail: 'noreply@example.org' }, { fromEmail: '' })
    ).toContain('Afzender adres van login e-mails');
  });

  it('lets an address that was never set stay empty, and a changed one through', () => {
    expect(emptiedAuthEmail({}, { contactEmail: '' })).toBeUndefined();
    expect(emptiedAuthEmail(undefined, { contactEmail: '' })).toBeUndefined();
    expect(
      emptiedAuthEmail(
        { contactEmail: 'a@example.org' },
        { contactEmail: 'b@example.org' }
      )
    ).toBeUndefined();
  });
});

describe('emptiedUserEmail', () => {
  it("stops a save that would empty a user's stored address", () => {
    expect(emptiedUserEmail({ email: 'jan@example.org' }, { email: '' })).toBe(
      '"E-mailadres" kan niet leeg worden opgeslagen. Vul een e-mailadres in.'
    );
  });

  it('lets a user without an address be saved, and a changed address through', () => {
    expect(emptiedUserEmail({ email: null }, { email: '' })).toBeUndefined();
    expect(emptiedUserEmail({}, { email: '' })).toBeUndefined();
    expect(
      emptiedUserEmail({ email: 'a@example.org' }, { email: 'b@example.org' })
    ).toBeUndefined();
  });
});
