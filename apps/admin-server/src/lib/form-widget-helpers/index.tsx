import { ControllerRenderProps } from 'react-hook-form';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Simple yes/no selector that uses a props.onFieldchanged method to emit changes
export function YesNoSelect(
  field: ControllerRenderProps<any, any>,
  props: { onFieldChanged?: (key: string, value: any) => void }
) {
  return (
    <Select
      onValueChange={(e: string) => {
        if (props.onFieldChanged) {
          props.onFieldChanged(field.name, e === 'true');
        }
        field.onChange(e === 'true');
      }}
      value={field.value ? 'true' : 'false'}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Ja" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectItem value="true">Ja</SelectItem>
        <SelectItem value="false">Nee</SelectItem>
      </SelectContent>
    </Select>
  );
}

export const undefinedToTrueOrProp = (
  varOrUndefined: boolean | undefined
): boolean => {
  return varOrUndefined === undefined || varOrUndefined;
};