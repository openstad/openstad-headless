
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { undefinedToTrueOrProp, YesNoSelect } from '@/lib/form-widget-helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import useTag from '@/hooks/use-tag';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ImageUploader } from "@/components/image-uploader";
import { X } from "lucide-react";
import InfoDialog from '@/components/ui/info-hover';
import ColorPicker from '@/components/colorpicker';

const formSchema = z.object({
  name: z.string(),
  type: z.string(),
  seqnr: z.coerce.number(),
  addToNewResources: z.boolean().optional(),
  backgroundColor: z.string().optional(),
  color: z.string().optional(),
  label: z.string().optional(),
  mapIcon: z.string().max(5000).optional(),
  listIcon: z.string().optional(),
  useDifferentSubmitAddress: z.boolean().optional(),
  image: z.string().optional(),
  defaultResourceImage: z.string().optional(),
  documentMapIconColor: z.string().optional(),
  newSubmitAddress: z.string().optional(),
  emails: z.array(z.object({ address: z.string() })).optional(),
});

export default function ProjectTagEdit() {
  const router = useRouter();
  const { project, tag } = router.query;
  const { data, isLoading, updateTag } = useTag(
    project as string,
    tag as string
  );

  const defaults = useCallback(
    () => ({
      name: data?.name || null,
      type: data?.type || null,
      seqnr: data?.seqnr || null,
      addToNewResources: data?.addToNewResources || false,
      backgroundColor: data?.backgroundColor || undefined,
      color: data?.color || undefined,
      label: data?.label || undefined,
      mapIcon: data?.mapIcon || undefined,
      listIcon: data?.listIcon || undefined,
      useDifferentSubmitAddress: undefinedToTrueOrProp(data?.useDifferentSubmitAddress),
      emails: data?.newSubmitAddress
        ? data.newSubmitAddress.split(',').map((address: string) => ({ address: address.trim() }))
        : [{ address: '' }],
      defaultResourceImage: data?.defaultResourceImage || '',
      documentMapIconColor: data?.documentMapIconColor || '#555588',
    }),
    [data]
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      newSubmitAddress: data?.newSubmitAddress || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.useDifferentSubmitAddress && values.emails !== undefined && values.emails.length > 0) {
      const csv = values.emails.map((email: { address: any; }) => email.address).join(',');
      values.newSubmitAddress = csv;
    }

    const tag = await updateTag(
      values.name,
      values.type,
      values.seqnr,
      values.addToNewResources,
      values.backgroundColor,
      values.color,
      values.label,
      values.mapIcon,
      values.listIcon,
      values.useDifferentSubmitAddress,
      values.newSubmitAddress,
      values.defaultResourceImage,
      values.documentMapIconColor
    );
    if (tag) {
      toast.success('Tag aangepast!');
    } else {
      toast.error('Er is helaas iets mis gegaan.')
    }
  }

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'emails',
  });

  useEffect(() => {
    const useDifferentSubmitAddress = form.watch('useDifferentSubmitAddress');

    if (!useDifferentSubmitAddress) {
      form.setValue('newSubmitAddress', '');
    }
  }, [form.watch('useDifferentSubmitAddress')]);

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Tags',
            url: `/projects/${project}/tags`,
          },
          {
            name: 'Tag aanpassen',
            url: `/projects/${project}/tags/${tag}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Tag</TabsTrigger>
              <TabsTrigger value="displaysettings">
                Weergave
              </TabsTrigger>
              <TabsTrigger value="notification">
                Notificatie opties
              </TabsTrigger>
              <TabsTrigger value="imagesettings">
                Afbeelding
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Tag Aanpassen</Heading>
                  <Separator className="my-4" />
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-1/2 grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Naam</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seqnr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Sequence nummer
                            <InfoDialog content={'Dit nummer bepaalt de volgorde waarin de tags worden getoond. Automatisch worden tientallen gegenereerd, zodat je later ruimte hebt om tags tussen te voegen.'} />
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addToNewResources"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Voeg deze tag automatisch toe aan nieuwe resources
                          </FormLabel>
                          {YesNoSelect(field, {})}
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
            </TabsContent>
            <TabsContent value="displaysettings" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Tag weergave</Heading>
                  <Separator className="my-4" />
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-1/2 grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Achtergrond kleur</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tekst kleur</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mapIcon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kaart icon</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="listIcon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource overview icon</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                      <FormField
                          control={form.control}
                          name="documentMapIconColor"
                          render={({ field }) => {
                              const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                  const newColor = e.target.value;
                                  field.onChange(newColor);
                              };

                              const handleResetColor = () => {
                                  const resetColor = "#555588";
                                  field.onChange(resetColor);
                              };

                              return (
                                  <FormItem>
                                      <FormLabel>Icon kleur op de kaart</FormLabel>
                                      <FormControl>
                                          <div>
                                              <ColorPicker value={field.value || "#555588"} onChange={handleColorChange} />
                                              <button type="button" onClick={handleResetColor}>
                                                  Reset
                                              </button>
                                          </div>
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              );
                          }}
                      />
                    <Button className="w-fit col-span-full" type="submit">
                      Opslaan
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="notification" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Notificatie opties</Heading>
                  <Separator className="my-4" />
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-1/2 grid grid-cols-1 gap-4">

                    <FormField
                      control={form.control}
                      name="useDifferentSubmitAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nieuwe inzendingen van resources met deze tag moeten worden bevestigd via een ander e-mailadres
                          </FormLabel>
                          {YesNoSelect(field, {})}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch('useDifferentSubmitAddress') && (
                      <>
                        {fields.map((field, index) => (
                          <div key={field.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <Controller
                              control={form.control}
                              name={`emails.${index}.address`}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  style={{
                                    flex: 1,
                                    marginRight: '10px',
                                    padding: '5px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    maxWidth: '500px',
                                  }}
                                  placeholder="Enter email address"
                                />
                              )}
                            />
                            <button type="button" onClick={() => remove(index)}> Verwijderen</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => append({ address: '' })}>Add Email</button>
                      </>
                    )}
                    <Button className="w-fit col-span-full" type="submit">
                      Opslaan
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            <TabsContent value="imagesettings" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Afbeelding opties</Heading>
                  <Separator className="my-4" />
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-1/2 grid grid-cols-1 gap-4">

                    <ImageUploader
                      form={form}
                      imageLabel="Upload hier een afbeelding die vervolgens automatisch wordt ingesteld als de standaardafbeelding voor de resource die aan deze tag is gekoppeld"
                      fieldName="image"
                      allowedTypes={["image/*"]}
                      onImageUploaded={(imageResult) => {
                        const result = typeof (imageResult.url) !== 'undefined' ? imageResult.url : '';
                        form.setValue('defaultResourceImage', result);
                        form.resetField('image')
                        form.trigger('defaultResourceImage');
                      }}
                    />

                    <div className="space-y-2 col-span-full md:col-span-1 flex flex-col">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Afbeeldingen</label>
                      <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                        {!!form.watch('defaultResourceImage') && (
                          <div style={{ position: 'relative' }}>
                            <img src={form.watch('defaultResourceImage')} alt={form.watch('defaultResourceImage')} />
                            <Button
                              color="red"
                              onClick={() => {
                                form.setValue('defaultResourceImage', '');
                              }}
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                              }}>
                              <X size={24} />
                            </Button>
                          </div>
                        )}
                      </section>
                    </div>

                    <Button className="w-fit col-span-full" type="submit">
                      Opslaan
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
