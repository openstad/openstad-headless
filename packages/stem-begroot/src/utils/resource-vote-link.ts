import { canLikeResource } from '@openstad-headless/lib/can-like';

// What happened with the resource from a stemlink (?openstadResourceId=):
// - added: it is now in the voter's selection
// - alreadySelected: it was already in the selection
// - notVotable: its status does not allow voting
// - noRoom: the selection is full, or there is not enough budget left
// - notFound: it does not exist, is not published, or is not part of this
//   widget (tag/status filter)
export type VoteLinkOutcome =
  'added' | 'alreadySelected' | 'notVotable' | 'noRoom' | 'notFound';

type VoteLinkResource = {
  id: number;
  budget?: number;
  statuses?: Array<{ extraFunctionality?: { canLike?: boolean } }>;
};

// Mirrors the "can this resource be added" rules of the widget's add button
// for the vote types that use a single selection (not the per-tag types).
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

// Removes ?openstadResourceId= from the address bar, so a reload or the return
// from the login page does not put the resource back after it was removed.
export function removeVoteLinkParamFromUrl(param: string) {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(param)) return;
    url.searchParams.delete(param);
    window.history.replaceState(window.history.state, '', url.toString());
  } catch {
    // ignore: the stemlink still works, it just stays in the address bar
  }
}
