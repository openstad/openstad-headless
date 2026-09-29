import { Calendar } from '@/components/ui/calendar';
import InfoDialog from '@/components/ui/info-hover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import React from 'react';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';

import { Button } from './ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type SimpleCalendarProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  fieldName: Path<T>;
  fieldInfo?: string;
  description?: string;
  label: string;
  placeholder?: string;
  withReset?: boolean;
  resetValue?: PathValue<T, Path<T>>;
  allowPast?: boolean;
};

export const SimpleCalendar = <T extends FieldValues>({
  form,
  fieldName,
  label,
  placeholder,
  withReset,
  resetValue,
  allowPast,
  fieldInfo,
  description,
}: SimpleCalendarProps<T>) => {
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
          {description && <FormDescription>{description}</FormDescription>}
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
                  captionLayout="dropdown-buttons"
                  fromYear={new Date().getFullYear() - 5}
                  toYear={new Date().getFullYear() + 50}
                  classNames={{ caption_label: 'hidden' }}
                  initialFocus
                />
                {withReset && (
                  <Button
                    onClick={() =>
                      // Without resetValue the field is cleared to undefined.
                      form.setValue(
                        field.name,
                        resetValue as PathValue<T, Path<T>>
                      )
                    }
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
