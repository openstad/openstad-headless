import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, RotateCcw, XCircleIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Delete } from 'lucide-react';

// Would like to use a generic solution <T> to enable hinting in the using file
// Now to remove the errors UseFormReturn<any> has to be used
export const SimpleCalendar: React.FC<{
  form: UseFormReturn<any>;
  fieldName: Path<FieldValues>;
  label: string;
  placeholder?: string;
  withReset?: boolean;
}> = ({ form, fieldName, label, placeholder, withReset }) => {
  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <div className="flex flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[240px] pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}>
                    {field.value ? (
                      format(field.value, 'PPP')
                    ) : (
                      <span>{placeholder || 'Kies een datum'}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(value) => {
                    return value
                      ? field.onChange(new Date(value.toDateString()))
                      : field.onChange(value);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
                {withReset && (
                  <Button
                    onClick={() => form.setValue(field.name, undefined)}
                    type="button"
                    variant={'ghost'}
                    className="w-full rounded-none text-xs font-normal">
                    Reset
                    <RotateCcw size="12" />
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <FormMessage />
        </FormItem>
      )}></FormField>
  );
};
