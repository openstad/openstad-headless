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
  summaryLabel: z.string(),
  summaryInfo: z.string(),
  summaryRequired: z.boolean(),
  summaryField: z.enum(['textbar', 'textarea']),
});

export default function WidgetResourceFormSummary() {
  type FormData = z.infer<typeof formSchema>;
  const category = 'summary';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    summaryLabel: widget?.config?.[category]?.summaryLabel || '',
    summaryInfo: widget?.config?.[category]?.summaryInfo || '',
    summaryRequired: widget?.config?.[category]?.summaryRequired || false,
    summaryField: widget?.config?.[category]?.summaryField || 'textbar',
  });

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
  }, [widget]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl" className="mb-4">
          Samenvatting
        </Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="summaryLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor de samenvatting.</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="summaryInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informatie over de samenvatting.</FormLabel>
                <FormControl>
                  <Textarea className="h-10 min-h-[40px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="summaryRequired"
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
            name="summaryField"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wat voor type veld wordt er gebruikt?</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Normal veld" />
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
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
