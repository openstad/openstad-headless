import { describe, expect, it } from 'vitest';

import resourceSerialization from './resourceSerialization.js';

const { hideEmailsForNormalUsers, filterModeratorOnlyExtraData } =
  resourceSerialization;

describe('hideEmailsForNormalUsers', () => {
  it('removes the email from comments and their replies', () => {
    const comments = [
      {
        user: { email: 'a@b.nl', name: 'A' },
        replies: [{ user: { email: 'c@d.nl', name: 'C' } }],
      },
    ];
    const result = hideEmailsForNormalUsers(comments);
    expect(result[0].user.email).toBeUndefined();
    expect(result[0].user.name).toBe('A');
    expect(result[0].replies[0].user.email).toBeUndefined();
  });
});

describe('filterModeratorOnlyExtraData', () => {
  const base = {
    resourceFormFieldKeys: ['naam', 'leeftijd'],
    moderatorOnlyExtraDataKeys: ['intern'],
    alwaysPublicExtraDataKeys: ['originalId', 'ranking'],
  };

  it('does not filter when the user role is "all"', () => {
    const data = { extraData: { intern: 'x', naam: 'y' } };
    filterModeratorOnlyExtraData(data, {
      ...base,
      userRole: 'all',
      canViewModerator: false,
      hasResourceFormConfig: true,
    });
    expect(data.extraData).toEqual({ intern: 'x', naam: 'y' });
  });

  it('does not filter when the user may view moderator data', () => {
    const data = { extraData: { intern: 'x', naam: 'y' } };
    filterModeratorOnlyExtraData(data, {
      ...base,
      userRole: 'member',
      canViewModerator: true,
      hasResourceFormConfig: true,
    });
    expect(data.extraData).toEqual({ intern: 'x', naam: 'y' });
  });

  it('with a resourceform config keeps form + always-public keys, drops the rest', () => {
    const data = {
      extraData: { naam: 'y', onbekend: 'z', originalId: 1, intern: 'x' },
    };
    filterModeratorOnlyExtraData(data, {
      ...base,
      userRole: 'member',
      canViewModerator: false,
      hasResourceFormConfig: true,
    });
    expect(data.extraData).toEqual({ naam: 'y', originalId: 1 }); // onbekend + intern removed
  });

  it('without a resourceform config keeps only always-public keys', () => {
    const data = {
      extraData: { naam: 'y', originalId: 1, ranking: 2, intern: 'x' },
    };
    filterModeratorOnlyExtraData(data, {
      ...base,
      userRole: 'member',
      canViewModerator: false,
      hasResourceFormConfig: false,
    });
    expect(data.extraData).toEqual({ originalId: 1, ranking: 2 });
  });

  it('returns data unchanged when there is no extraData object', () => {
    const data = { title: 'x' };
    const result = filterModeratorOnlyExtraData(data, {
      ...base,
      userRole: 'member',
      canViewModerator: false,
      hasResourceFormConfig: true,
    });
    expect(result).toBe(data);
  });
});
