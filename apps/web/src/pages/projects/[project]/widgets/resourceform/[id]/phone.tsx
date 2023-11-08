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
  phoneLabel: z.string(),
  phoneInfo: z.string(),
  phoneDisplayed: z.boolean(),
  phoneRequired: z.boolean(),
  phoneMinimumChars: z.coerce.number(),
  phoneMaximumChars: z.coerce.number(),
});

type FormData = z.infer<typeof formSchema>;
export default function WidgetResourceFormPhone() {
  const category = 'phone';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    phoneLabel: widget?.config?.[category]?.phoneLabel || '',
    phoneInfo: widget?.config?.[category]?.phoneInfo || '',
    phoneDisplayed: widget?.config?.[category]?.phoneDisplayed || false,
    phoneRequired: widget?.config?.[category]?.phoneRequired || false,
    phoneMinimumChars: widget?.config?.[category]?.phoneMinimumChars || 0,
    phoneMaximumChars: widget?.config?.[category]?.phoneMaximumChars || 0,
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
    <div>
      <Form {...form}>
        <Heading size="xl" className="mb-4">
          Resource Form • Telefoonnummer
        </Heading>
        <Separator className="mb-4" />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="phoneLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor het telefoonnummer</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informatie over het telefoonnummer</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneDisplayed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wordt het telefoonnummer weergegeven?</FormLabel>
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
            name="phoneRequired"
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
            name="phoneMinimumChars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Minimum hoeveelheid aan karakters voor het telefoonnummer
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
            name="phoneMaximumChars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Maximum hoeveelheid aan karakters voor het telefoonnummer
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="sticky bottom-0 py-4 bg-background border-t border-border flex flex-col">
            <Button className="self-end" type="submit">
              Opslaan
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
