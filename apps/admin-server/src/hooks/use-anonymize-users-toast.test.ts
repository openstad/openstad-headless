import { describe, expect, it } from 'vitest';

import { getAnonymizeUsersToastMessage } from './use-anonymize-users-toast';

describe('getAnonymizeUsersToastMessage', () => {
  it('maps known API errors to Dutch toasts', () => {
    expect(
      getAnonymizeUsersToastMessage(
        new Error(
          'Cannot anonymize users on an active project - first set the project-has-ended parameter'
        )
      )
    ).toBe(
      'Het project moet eerst zijn beëindigd voordat gebruikers geanonimiseerd kunnen worden.'
    );

    expect(
      getAnonymizeUsersToastMessage(
        new Error('You cannot anonymizeAllUsers this Project')
      )
    ).toBe(
      'Je hebt geen rechten om gebruikers van dit project te anonimiseren.'
    );

    expect(getAnonymizeUsersToastMessage(new Error('Something else'))).toBe(
      'Something else'
    );
    expect(getAnonymizeUsersToastMessage(undefined)).toBe(
      'Er is helaas iets mis gegaan.'
    );
  });
});
