import React, { useCallback, useEffect, useRef } from 'react';
import { Button } from '../../../../../../components/ui/button';
import { Input } from '../../../../../../components/ui/input';
import {
  Form,
  FormControl, FormItem, FormLabel, FormField, FormMessage
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
  // weights: z.record(z.record(z.object({
  //   weightX: z.union([z.string(), z.number()]).optional(),
  //   weightY: z.union([z.string(), z.number()]).optional(),
  //   choice: z.record(z.object({
  //     weight: z.union([z.string(), z.number()]).optional(),
  //   })).optional(),
  // }))).optional(),
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
      // const weights = widget?.config?.items?.reduce((acc: Record<string, any>, item: Item) => {
      //   acc[item.trigger] = item.weights || {};
      //   return acc;
      // }, {} as Record<string, any>) || {};

      if (choiceOptions.length > 0) {
        nextIdRef.current = Math.max(...choiceOptions.map((group: ChoiceOptions) => group.id)) + 1;
      } else {
        nextIdRef.current = 1;
      }
      return {
        choiceOptions
        // , weights
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
    // const updatedItems = widget?.config?.items.map((item: Item) => {
    //   const updatedWeights = values.weights?.[item.trigger] || item.weights;
    //   return { ...item, weights: updatedWeights };
    // });

    const updatedConfig = {
      ...widget.config,
      [category]: { choiceOptions: values.choiceOptions },
      // items: updatedItems
    };

    try {
      await updateConfig(updatedConfig);
      window.location.reload();
    } catch (error) {
      console.error('could not update', error);
    }
  }

  const handleAddGroup = () => {
    append({ id: nextIdRef.current, title: '', description: '' });
    nextIdRef.current += 1;
  };

  // const typeWithoutDimension = ['none', 'map', 'imageUpload', 'documentUpload', 'text'];

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
                        <Spacer size={2}/>
                          {/*{widget?.config?.items && Object.keys(widget.config.items).length > 0 && (*/}
                          {/*  <div key={index} className="p-0">*/}
                          {/*    <div className="p-0 flex flex-col justify-between col-span-2">*/}
                          {/*      <Heading size="xl">Bepaal de weging per vraag</Heading>*/}
                          {/*      <Separator className="my-4"/>*/}
                          {/*      <div className={`w-full col-span-full grid-cols-${dimensions.length + 1} grid gap-2 gap-y-2`}>*/}
                          {/*        <Heading size="lg">Vraag titel</Heading>*/}
                          {/*        {dimensions.length > 0 && dimensions.map((XY, i) => (*/}
                          {/*          <Heading key={i} size="lg">Weging {XY}</Heading>*/}
                          {/*        ))}*/}
                          {/*      </div>*/}
                          {/*      <div className="w-full mt-4 flex flex-col gap-y-4">*/}
                          {/*        {widget?.config?.items*/}
                          {/*          ?.filter((item: Item) => !typeWithoutDimension.includes(item.type ?? ""))*/}
                          {/*          ?.map((item: Item, itemIndex: number) => {*/}
                          {/*          const fieldId = field.id;*/}
                          {/*          const weights = item?.weights || {};*/}
                          {/*          const weightsForChoice = weights[fieldId] || {};*/}
                          {/*          const defaultX = weightsForChoice?.weightX || 0;*/}
                          {/*          const defaultY = weightsForChoice?.weightY || 0;*/}


                          {/*          if (['radiobox', 'checkbox', 'select'].includes(item.type ?? "")) {*/}
                          {/*            const choicesFields = weightsForChoice?.choice || {};*/}

                          {/*            return (*/}
                          {/*              <div*/}
                          {/*                className={`w-full col-span-full grid-cols-${dimensions.length + 1} grid gap-2 gap-y-2 items-center`}*/}
                          {/*                key={itemIndex}*/}
                          {/*              >*/}

                          {/*                {Object.entries(choicesFields).map(([choiceKey, choice], choiceIndex) => (*/}
                          {/*                    <React.Fragment key={choiceIndex}>*/}
                          {/*                      <p>{item.title} - optie: {choiceKey}</p>*/}

                          {/*                      {dimensions.length > 0 && dimensions.map((XY, i) => {*/}
                          {/*                        const defaultValue = XY === 'x' ? defaultX : defaultY;*/}

                          {/*                        return (*/}
                          {/*                          <FormField*/}
                          {/*                            key={i}*/}
                          {/*                            control={form.control}*/}
                          {/*                            name={`weights.${item.trigger}.${field.id}.choice.${choiceKey}.weight${XY}`}*/}
                          {/*                            render={({field}) => (*/}
                          {/*                              <FormItem>*/}
                          {/*                                <FormControl>*/}
                          {/*                                  <div className="weight-${XY.toLowerCase()}-container">*/}
                          {/*                                    <Input*/}
                          {/*                                      type="number"*/}
                          {/*                                      min={0}*/}
                          {/*                                      max={100}*/}
                          {/*                                      {...field}*/}
                          {/*                                      value={field.value ?? defaultValue}*/}
                          {/*                                      onChange={(e) => field.onChange(e.target.value || '')}*/}
                          {/*                                    />*/}
                          {/*                                  </div>*/}
                          {/*                                </FormControl>*/}
                          {/*                                <FormMessage/>*/}
                          {/*                              </FormItem>*/}
                          {/*                            )}*/}
                          {/*                          />*/}
                          {/*                        )*/}
                          {/*                      })}*/}
                          {/*                    </React.Fragment>*/}
                          {/*                  )*/}
                          {/*                )}*/}
                          {/*              </div>*/}
                          {/*            )*/}
                          {/*          } else {*/}
                          {/*            return (*/}
                          {/*              <div*/}
                          {/*                className={`w-full col-span-full grid-cols-${dimensions.length + 1} grid gap-2 gap-y-2 items-center`}*/}
                          {/*                key={itemIndex}*/}
                          {/*              >*/}
                          {/*                <p>{item.title}</p>*/}
                          {/*                {dimensions.length > 0 && dimensions.map((XY, i) => {*/}
                          {/*                  const defaultValue = XY === 'x' ? defaultX : defaultY;*/}

                          {/*                  return (*/}
                          {/*                    <FormField*/}
                          {/*                      key={i}*/}
                          {/*                      control={form.control}*/}
                          {/*                      name={`weights.${item.trigger}.${field.id}.weight${XY}`}*/}
                          {/*                      render={({field}) => (*/}
                          {/*                        <FormItem>*/}
                          {/*                          <FormControl>*/}
                          {/*                            <div className={`weight-${XY.toLowerCase()}-container`}>*/}
                          {/*                              <Input*/}
                          {/*                                type="number"*/}
                          {/*                                min={0}*/}
                          {/*                                max={100}*/}
                          {/*                                {...field}*/}
                          {/*                                value={field.value ?? defaultValue}*/}
                          {/*                                onChange={(e) => field.onChange(e.target.value || '')}*/}
                          {/*                              />*/}
                          {/*                            </div>*/}
                          {/*                          </FormControl>*/}
                          {/*                          <FormMessage/>*/}
                          {/*                        </FormItem>*/}
                          {/*                      )}*/}
                          {/*                    />*/}
                          {/*                  )*/}
                          {/*                })}*/}
                          {/*              </div>*/}
                          {/*            )*/}
                          {/*          }*/}
                          {/*        })}*/}
                          {/*      </div>*/}
                          {/*    </div>*/}
                          {/*  </div>*/}
                          {/*)}*/}
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
