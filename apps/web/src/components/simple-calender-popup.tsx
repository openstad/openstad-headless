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
import { CalendarIcon } from 'lucide-react';
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
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {withReset ? (
              <Button
                onClick={() => form.resetField(fieldName)}
                type="button"
                variant={'outline'}
                className={cn('font-normal')}>
                <Delete size="16" />
              </Button>
            ) : null}
          </div>

          <FormMessage />
        </FormItem>
      )}></FormField>
  );
};
