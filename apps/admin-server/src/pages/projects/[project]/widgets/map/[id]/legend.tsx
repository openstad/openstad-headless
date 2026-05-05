import ColorPicker from '@/components/colorpicker';
import { ImageUploader } from '@/components/image-uploader';
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
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  customLegend: z.array(
    z.object({
      label: z.string().min(1, 'Label is verplicht'),
      color: z.string().optional().default(''),
      icon: z.string().optional().default(''),
      iconUploader: z.string().optional(),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function WidgetMapLegend() {
  const category = 'customLegend';

  const { data: widget, updateConfig } = useWidgetConfig<any>();

  const router = useRouter();
  const { project } = router.query;

  const defaults = useCallback(
    () => ({
      customLegend: (widget?.config?.[category] || []).map((item: any) => ({
        label: item.label || '',
        color: item.color || '',
        icon: item.icon || '',
        iconUploader: '',
      })),
    }),
    [widget?.config]
  );

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customLegend',
    keyName: 'reactKey',
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: FormData) {
    const cleaned = values.customLegend.map(
      ({ iconUploader, ...rest }) => rest
    );
    try {
      await updateConfig({ [category]: cleaned });
    } catch (error) {
      console.error('could not update', error);
    }
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Legenda</Heading>
        <Separator className="my-4" />
        <p className="text-sm text-muted-foreground mb-4">
          Voeg legenda-items toe die bij de kaart worden getoond. Elk item heeft
          een label en een kleur of icoon.
        </p>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-2/3">
          {fields.map((field, index) => (
            <div
              key={field.reactKey}
              className="flex flex-col gap-3 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <Heading size="lg">Item {index + 1}</Heading>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}>
                  <X size={16} />
                </Button>
              </div>
              <FormField
                control={form.control}
                name={`customLegend.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Bijv. Project is afgerond"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`customLegend.${index}.color`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kleur</FormLabel>
                      <FormControl>
                        <ColorPicker
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`customLegend.${index}.icon`}
                  render={({ field: iconField }) => (
                    <FormItem>
                      <FormLabel>Icoon</FormLabel>
                      <FormControl>
                        <div>
                          <ImageUploader
                            form={form}
                            project={project as string}
                            imageLabel="Upload een icoon"
                            fieldName={`customLegend.${index}.iconUploader`}
                            allowedTypes={['image/*']}
                            onImageUploaded={(imageResult) => {
                              const result =
                                typeof imageResult.url !== 'undefined'
                                  ? imageResult.url
                                  : '';
                              form.setValue(
                                `customLegend.${index}.icon`,
                                result
                              );
                              form.resetField(
                                `customLegend.${index}.iconUploader`
                              );
                            }}
                          />
                          {iconField.value && (
                            <div className="mt-2 flex items-center gap-2">
                              <img
                                src={iconField.value}
                                alt="Legenda icoon"
                                className="h-8 w-8 object-contain"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  form.setValue(
                                    `customLegend.${index}.icon`,
                                    ''
                                  )
                                }>
                                <X size={16} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({ label: '', color: '', icon: '', iconUploader: '' })
            }
            className="w-fit">
            <Plus size={16} className="mr-1" />
            Item toevoegen
          </Button>

          <div>
            <Button type="submit">Opslaan</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
