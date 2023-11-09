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
  roleLabel: z.string(),
  roleInfo: z.string(),
  roleDisplayed: z.boolean(),
  roleRequired: z.boolean(),
  roleFieldType: z.enum(['textbar', 'textarea']),
  roleMinimumChars: z.coerce.number(),
  roleMaximumChars: z.coerce.number(),
});

type FormData = z.infer<typeof formSchema>;
export default function WidgetResourceFormRole() {
  const category = 'role';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    roleLabel: widget?.config?.[category]?.roleLabel || '',
    roleInfo: widget?.config?.[category]?.roleInfo || '',
    roleDisplayed: widget?.config?.[category]?.roleDisplayed || false,
    roleRequired: widget?.config?.[category]?.roleRequired || false,
    roleFieldType: widget?.config?.[category]?.roleFieldType || 'textbar',
    roleMinimumChars: widget?.config?.[category]?.roleMinimumChars || 0,
    roleMaximumChars: widget?.config?.[category]?.roleMaximumChars || 0,
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
          Resource Form • Rol
        </Heading>
        <Separator className="mb-4" />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="roleLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor de rol</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roleInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informatie over de rol</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roleDisplayed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wordt de rol weergegeven?</FormLabel>
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
            name="roleRequired"
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
            name="roleFieldType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Wat voor type veld wordt hiervoor gebruikt?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
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
            name="roleMinimumChars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Minimum hoeveelheid aan karakters voor de geschatte rol
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
            name="roleMaximumChars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Maximum hoeveelheid aan karakters voor de geschatte rol
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
