import {
  AgendaItem,
  AgendaItemsEditor,
} from '@/components/agenda-items-editor';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { withId } from '@/lib/widget-item-helpers';
import { AgendaWidgetProps } from '@openstad-headless/agenda/src/agenda';
import React, { useEffect, useState } from 'react';

export default function WidgetAgendaItems(
  props: AgendaWidgetProps & EditFieldProps<AgendaWidgetProps>
) {
  const [items, setItems] = useState<AgendaItem[]>([]);

  const itemsInitialized = React.useRef(false);
  // Snapshot of `items` that is in sync with the saved config: the initial empty
  // state and, once loaded, the values seeded from props. A push that only
  // reproduces this snapshot is not a user edit and must not mark the widget
  // dirty — otherwise merely mounting/switching to this tab would show a false
  // "unsaved changes" warning.
  const syncedItemsRef = React.useRef<string>(JSON.stringify(items));
  useEffect(() => {
    if (props?.items && props?.items?.length > 0 && !itemsInitialized.current) {
      itemsInitialized.current = true;
      const seeded = props.items.map(withId) as AgendaItem[];
      syncedItemsRef.current = JSON.stringify(seeded);
      setItems(seeded);
    }
  }, [props?.items]);

  const { onFieldChanged } = props;
  useEffect(() => {
    if (!onFieldChanged) return;
    // Only propagate genuine user edits to the draft; skip the mount/seed sync.
    if (JSON.stringify(items) === syncedItemsRef.current) return;
    // Default a missing `active` to false, same as the old per-tab save handler
    // did, now that items flow into the whole-widget draft instead of an
    // immediate per-tab save.
    const normalizedItems = items.map((item) => ({
      ...item,
      active: item.active ?? false,
    }));
    onFieldChanged('items', normalizedItems);
  }, [items]);

  return (
    <div>
      <AgendaItemsEditor
        items={items}
        onItemsChange={setItems}
        showActiveDates={props.useActiveDates}
      />
    </div>
  );
}
