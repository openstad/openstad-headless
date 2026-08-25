/**
 * Determines whether a field onChange emit counts as user interaction and
 * with which key it should be tracked.
 *
 * Fields also fire their onChange programmatically on mount (to register their
 * default value). Those emits carry `isInitial: true` and must NOT count as
 * interaction. Explanation fields provide their own key via `interactionKey`
 * so they can be tracked separately from the main question.
 */
export function resolveFieldInteraction(event: {
  name?: string;
  isInitial?: boolean;
  interactionKey?: string;
}): { track: boolean; key: string | null } {
  if (!event.name || event.isInitial) {
    return { track: false, key: null };
  }
  return { track: true, key: event.interactionKey || event.name };
}
