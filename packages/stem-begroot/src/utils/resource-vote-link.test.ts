import { describe, expect, it } from 'vitest';

import { decideVoteLinkOutcome, voteLinkMessage } from './resource-vote-link';

const resource = { id: 10, budget: 4000 };

describe('decideVoteLinkOutcome', () => {
  it('reports a resource that was not found', () => {
    expect(
      decideVoteLinkOutcome({
        resource: null,
        selectedResources: [],
        voteType: 'count',
        maxResources: 5,
      })
    ).toBe('notFound');
  });

  it('adds the resource for count votes when there is room', () => {
    expect(
      decideVoteLinkOutcome({
        resource,
        selectedResources: [{ id: 1 }, { id: 2 }],
        voteType: 'count',
        maxResources: 3,
      })
    ).toBe('added');
  });

  it('does not add when the maximum is reached', () => {
    expect(
      decideVoteLinkOutcome({
        resource,
        selectedResources: [{ id: 1 }, { id: 2 }, { id: 3 }],
        voteType: 'count',
        maxResources: 3,
      })
    ).toBe('noRoom');
  });

  it('recognises a resource that is already selected', () => {
    expect(
      decideVoteLinkOutcome({
        resource,
        selectedResources: [{ id: 1 }, { id: 2 }, { id: 10 }],
        voteType: 'count',
        maxResources: 3,
      })
    ).toBe('alreadySelected');
  });

  it('adds for budgeting only when the budget fits', () => {
    const selectedResources = [{ id: 1, budget: 5000 }];
    expect(
      decideVoteLinkOutcome({
        resource,
        selectedResources,
        voteType: 'budgeting',
        maxBudget: 9000,
      })
    ).toBe('added');
    expect(
      decideVoteLinkOutcome({
        resource,
        selectedResources,
        voteType: 'budgeting',
        maxBudget: 8999,
      })
    ).toBe('noRoom');
  });

  it('does not add when the status does not allow voting', () => {
    expect(
      decideVoteLinkOutcome({
        resource: {
          ...resource,
          statuses: [{ extraFunctionality: { canLike: false } }],
        },
        selectedResources: [],
        voteType: 'count',
        maxResources: 3,
      })
    ).toBe('notVotable');
  });
});

describe('voteLinkMessage', () => {
  it('mentions budget for budgeting and a full selection for count votes', () => {
    expect(voteLinkMessage('noRoom', 'budgeting')).toContain('budget');
    expect(voteLinkMessage('noRoom', 'count')).toContain('selectie is vol');
  });
});
