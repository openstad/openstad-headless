import { describe, expect, it } from 'vitest';

import { isEmailNotificationConsentRequired } from './email-consent';

const configWith = (requiredUserFields?: string[]) => ({
  auth: { provider: { openstad: { requiredUserFields } } },
});

describe('isEmailNotificationConsentRequired', () => {
  it('returns true when the field is required', () => {
    expect(
      isEmailNotificationConsentRequired(
        configWith(['firstName', 'emailNotificationConsent'])
      )
    ).toBe(true);
  });

  it('returns false when the field is absent', () => {
    expect(isEmailNotificationConsentRequired(configWith(['firstName']))).toBe(
      false
    );
  });

  it('returns false when requiredUserFields is missing', () => {
    expect(isEmailNotificationConsentRequired(configWith(undefined))).toBe(
      false
    );
    expect(isEmailNotificationConsentRequired({ auth: {} })).toBe(false);
  });

  it('returns false when config is undefined', () => {
    expect(isEmailNotificationConsentRequired(undefined)).toBe(false);
  });
});
