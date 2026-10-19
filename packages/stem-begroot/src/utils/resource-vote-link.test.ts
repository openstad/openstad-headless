import { describe, expect, it } from 'vitest';

import { decideVoteLinkOutcome, voteLinkMessage } from './resource-vote-link';

const resource = { id: 10, budget: 4000 };

describe('decideVoteLinkOutcome', () => {
  it('meldt een niet gevonden inzending', () => {
    expect(
      decideVoteLinkOutcome({
        resource: null,
        selectedResources: [],
        voteType: 'count',
        maxResources: 5,
      })
    ).toBe('notFound');
  });

  it('voegt toe bij stemmen op aantal als er nog plek is', () => {
    expect(
      decideVoteLinkOutcome({
        resource,
        selectedResources: [{ id: 1 }, { id: 2 }],
        voteType: 'count',
        maxResources: 3,
      })
    ).toBe('added');
  });

  it('voegt niet toe als het maximum aantal is bereikt', () => {
    expect(
      decideVoteLinkOutcome({
        resource,
        selectedResources: [{ id: 1 }, { id: 2 }, { id: 3 }],
        voteType: 'count',
        maxResources: 3,
      })
    ).toBe('noRoom');
  });

  it('herkent een inzending die al in de selectie staat', () => {
    expect(
      decideVoteLinkOutcome({
        resource,
        selectedResources: [{ id: 1 }, { id: 2 }, { id: 10 }],
        voteType: 'count',
        maxResources: 3,
      })
    ).toBe('alreadySelected');
  });

  it('voegt bij begroten alleen toe als het budget past', () => {
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

  it('voegt niet toe als de status stemmen niet toestaat', () => {
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
  it('noemt budget bij begroten en de volle selectie bij aantallen', () => {
    expect(voteLinkMessage('noRoom', 'budgeting')).toContain('budget');
    expect(voteLinkMessage('noRoom', 'count')).toContain('selectie is vol');
  });
});
