import {
  AgendaItem,
  AgendaItemsEditor,
} from '@/components/agenda-items-editor';
import { Button } from '@/components/ui/button';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { AgendaWidgetProps } from '@openstad-headless/agenda/src/agenda';
import { useEffect, useState } from 'react';

export default function WidgetAgendaItems(
  props: AgendaWidgetProps & EditFieldProps<AgendaWidgetProps>
) {
  const [items, setItems] = useState<AgendaItem[]>([]);

  useEffect(() => {
    if (props?.items && props?.items?.length > 0) {
      setItems(props?.items);
    }
  }, [props?.items]);

  const { onFieldChanged } = props;
  useEffect(() => {
    onFieldChanged('items', items);
  }, [items]);

  function handleSaveItems() {
    props.updateConfig({ ...props, items });
  }

  return (
    <div>
      <AgendaItemsEditor
        items={items}
        onItemsChange={setItems}
        showActiveDates={props.useActiveDates}
      />
      <div className="flex gap-2 mt-4">
        <Button
          className="w-fit"
          type="button"
          onClick={() => handleSaveItems()}>
          Configuratie opslaan
        </Button>
      </div>
    </div>
  );
}
