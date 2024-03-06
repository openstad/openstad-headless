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
import { Heading } from '@/components/ui/typography';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  resource: z.enum([
    'resource',
    'article',
    'activeUser',
    'resourceUser',
    'submission',
  ]),
  formName: z.string(),
  redirectUrl: z.string().url(),
  hideAdmin: z.boolean(),
  // organiseForm: z.enum(['static', 'staticAppended', 'dynamic']),
});

type FormData = z.infer<typeof formSchema>;
export default function WidgetResourceFormGeneral() {
  const category = 'general';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = useCallback(
    () => ({
      resource: widget?.config?.[category]?.resource || 'resource',
      formName: widget?.config?.[category]?.formName || '',
      redirectUrl: widget?.config?.[category]?.redirectUrl || '',
      hideAdmin: widget?.config?.[category]?.hideAdmin || false,
      // organiseForm: widget?.config?.[category]?.organiseForm || 'static',
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
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="resource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource type (vanuit de config)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Resource" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="article">Artikel</SelectItem>
                    <SelectItem value="activeUser">
                      Actieve gebruiker
                    </SelectItem>
                    <SelectItem value="resourceUser">
                      Gebruiker van de resource
                    </SelectItem>
                    <SelectItem value="submission">Oplevering</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="formName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Naam formulier. Deze moet uniek zijn binnen dit project.
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
            name="redirectUrl"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>
                  De URL waar de gebruiker naartoe wordt geleid na het invullen
                  van het formulier.
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
            name="hideAdmin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Wordt de admin verborgen van het project na de eerste publieke
                  actie?
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
          {/*<FormField*/}
          {/*  control={form.control}*/}
          {/*  name="organiseForm"*/}
          {/*  render={({ field }) => (*/}
          {/*    <FormItem className="mt-auto">*/}
          {/*      <FormLabel>*/}
          {/*        Hoe moeten de velden van het formulier opgesteld worden?*/}
          {/*      </FormLabel>*/}
          {/*      <Select onValueChange={field.onChange} value={field.value}>*/}
          {/*        <FormControl>*/}
          {/*          <SelectTrigger>*/}
          {/*            <SelectValue placeholder="Statisch (standaard)" />*/}
          {/*          </SelectTrigger>*/}
          {/*        </FormControl>*/}
          {/*        <SelectContent>*/}
          {/*          <SelectItem value="static">Statisch (standaard)</SelectItem>*/}
          {/*          <SelectItem value="staticAppended">*/}
          {/*            Statisch, met dynamische velden toegevoegd*/}
          {/*          </SelectItem>*/}
          {/*          <SelectItem value="dynamic">Dynamisch</SelectItem>*/}
          {/*        </SelectContent>*/}
          {/*      </Select>*/}
          {/*      <FormMessage />*/}
          {/*    </FormItem>*/}
          {/*  )}*/}
          {/*/>*/}
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
