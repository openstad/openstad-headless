import { Button } from '@/components/ui/button';
import {
  Form,
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  tipLabel: z.string(),
  tipInfo: z.string(),
  tipDisplayed: z.boolean(),
  tipRequired: z.boolean(),
  tipMinimumChars: z.coerce.number(),
  tipMaximumChars: z.coerce.number(),
});

type FormData = z.infer<typeof formSchema>;
export default function WidgetResourceFormTip() {
  const category = 'tip';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = useCallback(
    () => ({
      tipLabel: widget?.config?.[category]?.tipLabel || '',
      tipInfo: widget?.config?.[category]?.tipInfo || '',
      tipDisplayed: widget?.config?.[category]?.tipDisplayed || false,
      tipRequired: widget?.config?.[category]?.tipRequired || false,
      tipMinimumChars: widget?.config?.[category]?.tipMinimumChars || 0,
      tipMaximumChars: widget?.config?.[category]?.tipMaximumChars || 0,
    }),
    [widget?.config]
  );

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error('could not update', error);
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Tips</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor het advies</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informatie over het advies</FormLabel>
                <FormControl>
                  <Textarea className="h-10 min-h-[40px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipDisplayed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wordt het advies weergegeven?</FormLabel>
                <Select
                  onValueChange={(e: string) => field.onChange(e === 'true')}
                  value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Ja</SelectItem>
                    <SelectItem value="false">Nee</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Is dit veld verplicht?</FormLabel>
                <Select
                  onValueChange={(e: string) => field.onChange(e === 'true')}
                  value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Ja</SelectItem>
                    <SelectItem value="false">Nee</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipMinimumChars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Minimum hoeveelheid aan karakters voor het advies
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipMaximumChars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Maximum hoeveelheid aan karakters voor het advies
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
