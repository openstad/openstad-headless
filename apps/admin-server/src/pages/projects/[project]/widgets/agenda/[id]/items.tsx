import {
  AgendaItem,
  AgendaItemsEditor,
} from '@/components/agenda-items-editor';
import { useDraftItems } from '@/hooks/useDraftItems';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { AgendaWidgetProps } from '@openstad-headless/agenda/src/agenda';

export default function WidgetAgendaItems(
  props: AgendaWidgetProps & EditFieldProps<AgendaWidgetProps>
) {
  const [items, commitItems] = useDraftItems<AgendaItem>(
    props.items as AgendaItem[] | undefined,
    props.onFieldChanged,
    {
      // Legacy items predate `active`; the widget frontend expects a boolean.
      toDraft: (next) =>
        next.map((item) => ({ ...item, active: item.active ?? false })),
    }
  );

  return (
    <div>
      <AgendaItemsEditor
        items={items}
        onItemsChange={commitItems}
        showActiveDates={props.useActiveDates}
      />
    </div>
  );
}
