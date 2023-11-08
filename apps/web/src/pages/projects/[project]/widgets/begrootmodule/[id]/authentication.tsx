import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  authEmbedded: z.enum(['no', 'email', 'code', 'sms']),
  scrollBack: z.boolean(),
});

export default function BegrootmoduleAuthentication() {
  const category = 'authentication';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();
  const defaults = () => ({
    authEmbedded: widget?.config?.[category]?.authEmbedded || 'no',
    scrollBack: widget?.config?.[category]?.scrollBack || false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateConfig({ [category]: values });
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Authenticatie</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">
          <FormField
            control={form.control}
            name="authEmbedded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Authenticatie formulier embedden</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no">Nee</SelectItem>
                    <SelectItem value="email">Email login URL</SelectItem>
                    <SelectItem value="code">Stemcode</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="scrollBack"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Is het mogelijk om terug naar het budgetblok te scrollen
                  wanneer iemand terugkeert van het gebruiken van zijn/haar
                  stemcode in oAuth?
                </FormLabel>
                <Select
                  onValueChange={(e: string) => field.onChange(e === 'true')}
                  value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ja" />
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
          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
