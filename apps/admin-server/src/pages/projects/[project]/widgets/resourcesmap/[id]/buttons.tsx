import { useState } from 'react';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import * as z from 'zod';
import * as Switch from '@radix-ui/react-switch';
import { ResourceOverviewMapWidgetTabProps } from '.';

const formSchema = z.object({
  ctaButton: z.object({
    show: z.boolean(),
    label: z.string().optional(),
    href: z.string().optional(),
  }),
  countButton: z.object({
    show: z.boolean(),
    label: z.string().optional(),
  }),
});


type SchemaKey = keyof typeof formSchema.shape;

export default function WidgetResourcesMapButton(
  props: ResourceOverviewMapWidgetTabProps &
    EditFieldProps<ResourceOverviewMapWidgetTabProps> & {
      omitSchemaKeys?: Array<SchemaKey>;
    }
) {

  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      countButton: props?.countButton,
      ctaButton: props?.ctaButton,
    },
  });

  const [showCtaFields, setShowCtaFields] = useState(props?.ctaButton?.show || false)
  const [showCountFields, setShowCountFields] = useState(props?.countButton?.show || false)

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">

          <Heading size="xl">Call-To-Action knop</Heading>
          <FormField
            control={form.control}
            name="ctaButton.show"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Toon een &apos;Call To Action&apos; knop
                </FormLabel>
                <Switch.Root
                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                  onCheckedChange={(e: boolean) => {
                    field.onChange(e);
                    setShowCtaFields(e);
                    props.onFieldChanged('ctaButton',
                      {
                        show: e,
                        label: props?.ctaButton?.label,
                        href: props?.ctaButton?.href,
                      }
                    )
                  }}
                  checked={field.value}>
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                </Switch.Root>
                <FormMessage />
              </FormItem>
            )}
          />

          {showCtaFields ?
            <>
              <FormField
                control={form.control}
                name="ctaButton.label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tekst op de knop
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv: Stuur nu je plan in"
                        type="text"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          props.onFieldChanged('ctaButton',
                            {
                              show: props?.ctaButton?.show,
                              label: e.target.value,
                              href: props?.ctaButton?.href,
                            }
                          )
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ctaButton.href"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv: /resource-formulier"
                        type="text"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          props.onFieldChanged('ctaButton',
                            {
                              show: props?.ctaButton?.show,
                              label: props?.countButton?.label,
                              href: e.target.value,
                            }
                          )
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
            : null}

          <Heading size="xl">Aantal inzendingen</Heading>
          <FormField
            control={form.control}
            name="countButton.show"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Toon aantal inzendingen
                </FormLabel>
                <Switch.Root
                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                  onCheckedChange={(e: boolean) => {
                    field.onChange(e);
                    setShowCountFields(e);
                    props.onFieldChanged('countButton',
                      {
                        show: e,
                        label: props?.countButton?.label,
                      }
                    )
                  }}
                  checked={field.value}>
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                </Switch.Root>
                <FormMessage />
              </FormItem>
            )}
          />

          {showCountFields ?
            <>
              <FormField
                control={form.control}
                name="countButton.label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tekst op de knop
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv: plannen"
                        type="text"
                        {...field}
                        onChange={(e) => {
                          props.onFieldChanged('countButton',
                            {
                              show: props?.countButton?.show,
                              label: e.target.value,
                            }
                          )
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
            : null}

          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
