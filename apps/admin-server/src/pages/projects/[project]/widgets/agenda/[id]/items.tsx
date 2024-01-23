import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { AgendaWidgetProps } from '@openstad/agenda/src/agenda';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  trigger: z.string(),
  title: z.string(),
  description: z.string(),
  active: z.boolean(),
  links: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        openInNewWindow: z.boolean(),
      })
    )
    .optional(),
});

export default function WidgetAgendaItems(
  props: AgendaWidgetProps & EditFieldProps<AgendaWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    // props.updateConfig({ ...props, ...values });
    const newItem = {
      trigger: values.trigger || '0',
      title: values.title,
      description: values.description,
      active: values.active,
      links: values.links || [],
    };

    const updatedItems = [...(props.items || []), newItem];
    props.updateConfig({ ...props, items: updatedItems });
    console.log(values);
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      trigger: `${
        props.items?.length &&
        parseInt(props.items[props.items?.length - 1].trigger) + 1
      }`,
      title: '',
      description: '',
      active: true,
    },
  });

  type Item = {
    trigger: string;
    title?: string;
    description: string;
    active: boolean;
    links?: Array<{
      title: string;
      url: string;
      openInNewWindow: boolean;
    }>;
  };
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (props?.items && props?.items?.length > 0) {
      setItems(props?.items);
    }
  }, [props?.items]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Display</Heading>
        <Separator className="my-4" />
        <div className="lg:w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="lg:w-3/4 w-full  grid gap-4">
            <FormField
              control={form.control}
              name="trigger"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trigger</FormLabel>
                  <Input type="hidden" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel (Bijvoorbeeld "19 April")</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschrijving</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actief</FormLabel>
                  {YesNoSelect(field, props)}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-fit col-span-full" type="submit">
              Voeg item toe
            </Button>
          </form>
          <div>
            <FormLabel>Lijst van huidige items:</FormLabel>
            <div>
              {items.length > 0
                ? items
                    ?.sort((a, b) => {
                      if (a.trigger < b.trigger) {
                        return -1;
                      }
                      if (a.trigger > b.trigger) {
                        return 1;
                      }
                      return 0;
                    })
                    .map((item) => {
                      return (
                        <div key={item.trigger}>
                          <div>{`${item.trigger}: ${item.title}`}</div>
                        </div>
                      );
                    })
                : 'Geen items'}
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
