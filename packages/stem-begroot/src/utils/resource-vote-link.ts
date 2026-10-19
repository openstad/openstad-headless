import { canLikeResource } from '@openstad-headless/lib/can-like';

export type VoteLinkOutcome =
  'added' | 'alreadySelected' | 'notVotable' | 'noRoom' | 'notFound';

type VoteLinkResource = {
  id: number;
  budget?: number;
  statuses?: Array<{ extraFunctionality?: { canLike?: boolean } }>;
};

export function decideVoteLinkOutcome({
  resource,
  selectedResources,
  voteType,
  maxBudget,
  maxResources,
}: {
  resource: VoteLinkResource | null | undefined;
  selectedResources: Array<{ id: number; budget?: number }>;
  voteType: string;
  maxBudget?: number;
  maxResources?: number;
}): VoteLinkOutcome {
  if (!resource) return 'notFound';

  if (selectedResources.some((r) => r.id === resource.id)) {
    return 'alreadySelected';
  }

  if (!canLikeResource(resource)) return 'notVotable';

  if (voteType === 'budgeting') {
    const budgetUsed = selectedResources.reduce(
      (total, r) => total + (r.budget || 0),
      0
    );
    return (resource.budget || 0) <= (maxBudget || 0) - budgetUsed
      ? 'added'
      : 'noRoom';
  }

  return (maxResources || 0) > selectedResources.length ? 'added' : 'noRoom';
}

export function voteLinkMessage(
  outcome: VoteLinkOutcome,
  voteType: string
): string {
  switch (outcome) {
    case 'added':
      return 'Deze inzending is nu toegevoegd aan je selectie.';
    case 'alreadySelected':
      return 'Deze inzending staat al in je selectie.';
    case 'notVotable':
      return 'Op deze inzending kun je op dit moment niet stemmen.';
    case 'noRoom':
      return voteType === 'budgeting'
        ? 'Er is niet genoeg budget over om deze inzending toe te voegen. Haal eerst een andere inzending uit je selectie.'
        : 'Je selectie is vol. Haal eerst een andere inzending uit je selectie om deze toe te voegen.';
    case 'notFound':
    default:
      return 'Je hebt een stemlink geopend, maar deze inzending doet niet mee aan deze stemming. Kies hieronder zelf je favoriete plannen.';
  }
}

export function removeVoteLinkParamFromUrl(param: string) {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(param)) return;
  url.searchParams.delete(param);
  window.history.replaceState(window.history.state, '', url.toString());
}
