import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

const HEIGHT_OPTIONS = [
  { value: '250px', label: 'Klein (250px)' },
  { value: '350px', label: 'Gemiddeld (350px)' },
  { value: '450px', label: 'Groot (450px)' },
  { value: '550px', label: 'Extra groot (550px)' },
  { value: '100vh', label: 'Volledige hoogte (100vh)' },
];

const WIDTH_OPTIONS = [
  { value: '50%', label: '50%' },
  { value: '75%', label: '75%' },
  { value: '100%', label: '100%' },
];

function isPresetValue(
  value: string | undefined,
  options: { value: string }[]
): boolean {
  if (!value) return false;
  return options.some((opt) => opt.value === value);
}

type MapDimensionFieldsProps = {
  form: UseFormReturn<any>;
  onFieldChange: (name: string, value: string) => void;
};

export function MapDimensionFields({
  form,
  onFieldChange,
}: MapDimensionFieldsProps) {
  const currentWidth = form.watch('width');
  const currentHeight = form.watch('height');

  const [widthIsCustom, setWidthIsCustom] = useState(
    () => !!currentWidth && !isPresetValue(currentWidth, WIDTH_OPTIONS)
  );
  const [heightIsCustom, setHeightIsCustom] = useState(
    () => !!currentHeight && !isPresetValue(currentHeight, HEIGHT_OPTIONS)
  );

  useEffect(() => {
    setWidthIsCustom(
      !!currentWidth && !isPresetValue(currentWidth, WIDTH_OPTIONS)
    );
  }, [currentWidth]);

  useEffect(() => {
    setHeightIsCustom(
      !!currentHeight && !isPresetValue(currentHeight, HEIGHT_OPTIONS)
    );
  }, [currentHeight]);

  return (
    <>
      <FormField
        control={form.control}
        name="width"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Breedte</FormLabel>
            <Select
              onValueChange={(value) => {
                if (value === '__custom') {
                  setWidthIsCustom(true);
                } else {
                  setWidthIsCustom(false);
                  onFieldChange(field.name, value);
                  field.onChange(value);
                }
              }}
              value={widthIsCustom ? '__custom' : field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een breedte" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {WIDTH_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
                <SelectItem value="__custom">Aangepast</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {widthIsCustom && (
        <FormField
          control={form.control}
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aangepaste breedte</FormLabel>
              <FormControl>
                <Input
                  placeholder="Bijv: 80%"
                  value={field.value || ''}
                  onChange={(e) => {
                    onFieldChange(field.name, e.target.value);
                    field.onChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hoogte</FormLabel>
            <Select
              onValueChange={(value) => {
                if (value === '__custom') {
                  setHeightIsCustom(true);
                } else {
                  setHeightIsCustom(false);
                  onFieldChange(field.name, value);
                  field.onChange(value);
                }
              }}
              value={heightIsCustom ? '__custom' : field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een hoogte" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {HEIGHT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
                <SelectItem value="__custom">Aangepast</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {heightIsCustom && (
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aangepaste hoogte</FormLabel>
              <FormControl>
                <Input
                  placeholder="Bijv: 400px"
                  value={field.value || ''}
                  onChange={(e) => {
                    onFieldChange(field.name, e.target.value);
                    field.onChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
