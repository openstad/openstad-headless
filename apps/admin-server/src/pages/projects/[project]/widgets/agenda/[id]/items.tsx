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
  /**
   * The list starts empty and is seeded from the saved config afterwards, so the
   * draft may only be updated once the user actually changed the list. Pushing
   * on a render that still holds the empty list wipes the stored items.
   */
  const itemsTouchedRef = React.useRef(false);
  const updateItems: typeof setItems = (updater) => {
    itemsTouchedRef.current = true;
    setItems(updater);
  };

  const itemsInitialized = React.useRef(false);
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
    if (!itemsTouchedRef.current) return;
    const serialized = JSON.stringify(items);
    if (serialized === syncedItemsRef.current) return;
    syncedItemsRef.current = serialized;
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
        onItemsChange={updateItems}
        showActiveDates={props.useActiveDates}
      />
    </div>
  );
}
