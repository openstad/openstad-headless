import { describe, expect, it } from 'vitest';

import { buildLikeActions } from './vote-actions.js';

describe('buildLikeActions', () => {
  it('creates a like on a new resource without touching likes on other resources', () => {
    const existingVotes = [{ resourceId: 1, opinion: 'yes' }];
    const actions = buildLikeActions(
      [{ resourceId: 2, opinion: 'yes' }],
      existingVotes
    );
    expect(actions).toEqual([
      { action: 'create', vote: { resourceId: 2, opinion: 'yes' } },
    ]);
  });

  it('deletes the existing like when the opinion is the same (toggle off)', () => {
    const existingVote = { resourceId: 1, opinion: 'yes' };
    const actions = buildLikeActions(
      [{ resourceId: 1, opinion: 'yes' }],
      [existingVote]
    );
    expect(actions).toEqual([{ action: 'delete', vote: existingVote }]);
  });

  it('updates the existing like when the opinion differs', () => {
    const existingVote = { resourceId: 1, opinion: 'yes' };
    const actions = buildLikeActions(
      [{ resourceId: 1, opinion: 'no' }],
      [existingVote]
    );
    expect(actions).toEqual([
      { action: 'update', vote: { resourceId: 1, opinion: 'no' } },
    ]);
  });
});
