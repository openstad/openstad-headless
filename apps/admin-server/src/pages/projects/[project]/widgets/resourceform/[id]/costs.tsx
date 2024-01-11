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
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  costsLabel: z.string(),
  costsInfo: z.string(),
  costsDisplayed: z.boolean(),
  costsRequired: z.boolean(),
  costsFieldType: z.enum(['textbar', 'textarea']),
  costsMinimumChars: z.coerce.number(),
  costsMaximumChars: z.coerce.number(),
});

type FormData = z.infer<typeof formSchema>;
export default function WidgetResourceFormCosts() {
  const category = 'costs';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = useCallback(
    () => ({
      costsLabel: widget?.config?.[category]?.costsLabel || '',
      costsInfo: widget?.config?.[category]?.costsInfo || '',
      costsDisplayed: widget?.config?.[category]?.costsDisplayed || false,
      costsRequired: widget?.config?.[category]?.costsRequired || false,
      costsFieldType: widget?.config?.[category]?.costsFieldType || 'textbar',
      costsMinimumChars: widget?.config?.[category]?.costsMinimumChars || 0,
      costsMaximumChars: widget?.config?.[category]?.costsMaximumChars || 0,
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
        <Heading size="xl">Geschatte kosten</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="costsLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor de geschatte kosten</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costsInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informatie over de geschatte kosten</FormLabel>
                <FormControl>
                  <Textarea className="h-10 min-h-[40px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costsDisplayed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Worden de geschatte kosten weergegeven?</FormLabel>
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
            name="costsRequired"
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
            name="costsFieldType"
            render={({ field }) => (
              <FormItem className="col-span-2 lg:w-fit">
                <FormLabel>
                  Wat voor type veld wordt hiervoor gebruikt?
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Normaal veld" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="textbar">Normaal veld</SelectItem>
                    <SelectItem value="textarea">Groot veld</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costsMinimumChars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Minimum hoeveelheid aan karakters voor de geschatte kost
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costsMaximumChars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Maximum hoeveelheid aan karakters voor de geschatte kost
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
