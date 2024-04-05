import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { Button } from './ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import InfoDialog from './ui/info-hover';

// Would like to use a generic solution <T> to enable hinting in the using file
// Now to remove the errors UseFormReturn<any> has to be used
export const SimpleCalendar: React.FC<{
  form: UseFormReturn<any>;
  fieldName: Path<FieldValues>;
  fieldInfo?: string;
  label: string;
  placeholder?: string;
  withReset?: boolean;
  allowPast?: boolean;
}> = ({ form, fieldName, label, placeholder, withReset, allowPast, fieldInfo }) => {
  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            {label}
            {fieldInfo && <InfoDialog content={fieldInfo} />}
            </FormLabel>
          <div className="flex flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[100%] pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}>
                    {field.value ? (
                      format(field.value, 'PPP')
                    ) : (
                      <span>{placeholder || 'Kies een datum'}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4" />
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
                  disabled={
                    allowPast
                      ? false
                      : (date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
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
