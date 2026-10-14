import {
  resolveItemsUpdate,
  seedItems,
  stripGeneratedIds,
} from '@/lib/widget-item-helpers';
import { useCallback, useRef, useState } from 'react';

export type ItemsUpdater<T> = T[] | ((currentItems: T[]) => T[]);

export type UseDraftItemsOptions<T> = {
  /** Draft key to write. Defaults to `items`. */
  field?: string;
  /** Shape the list for the draft, e.g. to fill in a legacy default. */
  toDraft?: (items: T[]) => unknown[];
};

/**
 * Local list state for a widget "Items" tab.
 *
 * The draft is written ONLY from `commitItems`, never from an effect — this
 * hook deliberately has no `useEffect` at all. That is the whole point: an
 * effect that mirrors local state into the draft also runs on mount, and a
 * mount-time write of the still-empty list is what wiped saved items when the
 * tab was opened and saved. The sibling contract is `useSyncDraftForm` in
 * useWidgetDraft.tsx, which can only push from a `form.watch` change.
 *
 * Seeds exactly once. Each tab renders as `{previewConfig && <Items ... />}`
 * and `previewConfig` is built atomically from the whole `widget.config`, so
 * the saved items are already there on the first render. Navigating to another
 * widget of the same type reseeds `previewConfig` without remounting the page,
 * so the parent index.tsx must pass `key={String(id)}` to the tab.
 */
export function useDraftItems<T extends { id?: string }>(
  propsItems: T[] | undefined,
  onFieldChanged?: (key: string, value: any) => void,
  options?: UseDraftItemsOptions<T>
): [T[], (updater: ItemsUpdater<T>) => void] {
  const [seed] = useState(() => seedItems(propsItems));
  const [items, setItems] = useState<T[]>(seed.items);

  // `commitItems` can run more than once in a tick (React batches state
  // updates), so the ref -- not the render closure -- holds the latest list.
  const itemsRef = useRef<T[]>(items);

  // Latest-ref convention, as in useWidgetDraft.tsx.
  const onFieldChangedRef = useRef(onFieldChanged);
  onFieldChangedRef.current = onFieldChanged;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const commitItems = useCallback(
    (updater: ItemsUpdater<T>) => {
      const next = resolveItemsUpdate(itemsRef.current, updater);
      itemsRef.current = next;
      setItems(next);

      const { field = 'items', toDraft } = optionsRef.current ?? {};
      const persisted = stripGeneratedIds(next, seed.generatedIds);
      onFieldChangedRef.current?.(
        field,
        toDraft ? toDraft(persisted) : persisted
      );
    },
    [seed]
  );

  return [items, commitItems];
}
