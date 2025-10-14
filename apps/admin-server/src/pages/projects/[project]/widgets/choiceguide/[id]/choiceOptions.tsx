import React, { useCallback, useEffect, useRef } from 'react';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import {
  Form,
  FormControl, FormItem, FormLabel, FormField, FormMessage, FormDescription
} from '../../../../../../components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { X } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Spacer } from "@/components/ui/spacer";
import AccordionUI from "@/components/ui/accordion";
import { ImageUploader } from '@/components/image-uploader';
import {ChoiceOptions, Item, Weight} from "@openstad-headless/choiceguide/src/props";
import { useRouter } from 'next/router';

const formSchema = z.object({
  choiceOptions: z.array(
    z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      imageUploader: z.string().optional(),
    })
  ),
});


export default function WidgetChoiceGuideChoiceOptions(props: ChoiceOptions) {
  const category = 'choiceOption';

  const router = useRouter();
  const { project } = router.query;

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig<any>();

  const chosenConfig = widget?.config?.choiceGuide?.choicesType || 'default';
  let dimensions = chosenConfig === 'plane'
    ? ['X', 'Y']
    : ['X'];
  dimensions = chosenConfig === 'hidden' ? [] : dimensions;

  const nextIdRef = useRef<number>(1);

  const defaults = useCallback(
    () => {
      const choiceOptions = widget?.config?.[category]?.choiceOptions || [];

      if (choiceOptions.length > 0) {
        nextIdRef.current = Math.max(...choiceOptions.map((group: ChoiceOptions) => group.id)) + 1;
      } else {
        nextIdRef.current = 1;
      }
      return {
        choiceOptions
      };
    },
    [widget?.config]
  );


  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'choiceOptions',
    keyName: "reactKey",
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: FormData) {
    const updatedConfig = {
      ...widget.config,
      [category]: { choiceOptions: values.choiceOptions },
    };

    try {
      await updateConfig(updatedConfig);
      window.location.reload();
    } catch (error) {
      console.error('could not update', error);
    }
  }

  const handleAddGroup = () => {
    const choiceOptions = form.getValues('choiceOptions') || [];
    const newId = choiceOptions.length
      ? Math.max(...choiceOptions.map((group: ChoiceOptions) => Number(group.id))) + 1
      : nextIdRef.current;

    append({ id: newId, title: '', description: '' });
    nextIdRef.current = newId;
  };

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Keuze opties</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full"
        >
          {fields.map((field, index) => {
            const title = field.title ? field.title : `Keuze optie ${field.id}`
            const image = form.getValues(`choiceOptions.${index}.image`) || "";

            return (
              <AccordionUI
                key={field.reactKey}
                items={[
                  {
                    header: title,
                    content: (
                      <div className="flex flex-col w-full col-span-full mt-4 mb-4 bg-gray-100 rounded-md p-6">
                        <Spacer size={1}/>
                        <div className="flex justify-start items-center">
                          <p>{field.title ? `Verwijder ${field.title}?` : `Verwijder keuze optie ${field.id}?`}</p>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => remove(index)}
                            className="p-1 ml-2"
                            style={{padding: '3px 6px'}}
                          >
                            <X className="w-4 h-4"/>
                          </Button>
                        </div>
                        <Spacer size={3}/>
                        <FormField
                          control={form.control}
                          name={`choiceOptions.${index}.title`}
                          render={({field}) => (
                            <FormItem>
                              <FormLabel>Titel</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Titel van de keuze optie" value={field.value ?? ''}/>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Spacer size={2}/>
                        <FormField
                          control={form.control}
                          name={`choiceOptions.${index}.description`}
                          render={({field}) => (
                            <FormItem>
                              <FormLabel>Beschrijving</FormLabel>
                              <FormControl>
                                <Textarea rows={5} {...field} placeholder="Beschrijving van de keuze optie"
                                          value={field.value ?? ''}/>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Spacer size={2}/>
                        <FormField
                          control={form.control}
                          name={`choiceOptions.${index}.image`}
                          render={({ field }) => (
                            <FormItem className="col-span-full lg:col-span-1">
                              <FormControl>
                                <ImageUploader
                                  form={form}
                                  project={project as string}
                                  imageLabel="Upload hier een afbeelding"
                                  fieldName={`choiceOptions.${index}.imageUploader`}
                                  allowedTypes={["image/*"]}
                                  onImageUploaded={(imageResult) => {
                                    const result = typeof (imageResult.url) !== 'undefined' ? imageResult.url : '';
                                    form.setValue(`choiceOptions.${index}.image`, result);
                                    form.resetField(`choiceOptions.${index}.imageUploader`);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-2 col-span-full md:col-span-1 flex flex-col">
                          {!!image && (
                            <>
                              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Afbeeldingen</label>
                              <section className="grid col-span-full grid-cols-1 gap-y-4">
                                <div className="relative grid col-span-full grid-cols-3 gap-x-4 items-center">
                                  <img src={image} alt={image} />
                                  <Button
                                    color="red"
                                    onClick={() => {
                                      form.setValue(`choiceOptions.${index}.image`, '');
                                      form.resetField(`choiceOptions.${index}.imageUploader`);
                                    }}
                                    className="absolute left-0 top-0">
                                    <X size={24} />
                                  </Button>
                                </div>
                              </section>
                            </>
                          )}
                        </div>

                        <Spacer size={2}/>
                      </div>
                    )
                  }
                ]}
              />
            )
          })}

          <Button
            type="button"
            onClick={handleAddGroup}
            className="w-fit col-span-full mt-4 block"
          >
            Voeg Keuze optie Toe
          </Button>

          <Button type="submit" className="w-fit col-span-full mt-4">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
