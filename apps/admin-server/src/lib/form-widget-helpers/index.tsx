import { ControllerRenderProps } from 'react-hook-form';
import * as Switch from '@radix-ui/react-switch';
import { useEffect } from 'react';

// Simple yes/no selector that uses a props.onFieldchanged method to emit changes
export function YesNoSelect(
  field: ControllerRenderProps<any, any>,
  props: { onFieldChanged?: (key: string, value: any) => void }
) {

  // Init value
  useEffect(() => {
    if(field.value === undefined || field.value === null) {
      field.onChange(false);
      if (props.onFieldChanged && field.name) {
        props.onFieldChanged(field.name, false);
      }
    }
  }, []);

  return (
    <Switch.Root
      className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
      onCheckedChange={(e: boolean) => {
        field.onChange(e);
        if (props.onFieldChanged) {
          props.onFieldChanged(field.name, e);
        }
      }}
      checked={field.value}>
      <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
    </Switch.Root>
  );
}

export const undefinedToTrueOrProp = (
  varOrUndefined: boolean | undefined
): boolean => {
  return varOrUndefined === undefined || varOrUndefined;
};