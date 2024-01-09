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
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  labelOpen: z.string(),
  labelClosed: z.string(),
  labelAccepted: z.string(),
  labelDenied: z.string(),
  labelBusy: z.string(),
  labelDone: z.string(),
});

export default function WidgetResourceDetailLabel() {
  type FormData = z.infer<typeof formSchema>;
  const category = 'label';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    labelOpen: widget?.config?.[category]?.labelOpen || '',
    labelClosed: widget?.config?.[category]?.labelClosed || '',
    labelAccepted: widget?.config?.[category]?.labelAccepted || '',
    labelDenied: widget?.config?.[category]?.labelDenied || '',
    labelBusy: widget?.config?.[category]?.labelBusy || '',
    labelDone: widget?.config?.[category]?.labelDone || '',
  });

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error('could falset update', error);
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
        <Heading size="xl">Labels</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="labelOpen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor foto: OPEN</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="labelClosed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor foto: GESLOTEN</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="labelAccepted"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor foto: GEACCEPTEERD</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="labelDenied"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor foto: AFGEWEZEN</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="labelBusy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor foto: BEZIG</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="labelDone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor foto: AFGEROND</FormLabel>
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
