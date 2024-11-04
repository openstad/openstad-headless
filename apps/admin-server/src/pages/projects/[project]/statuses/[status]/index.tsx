import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

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
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import useStatus from '@/hooks/use-status';
import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X } from "lucide-react";
import { ImageUploader } from "@/components/image-uploader";

const formSchema = z.object({
  name: z.string(),
  seqnr: z.coerce.number(),
  backgroundColor: z.string().optional(),
  addToNewResources: z.boolean().optional(),
  color: z.string().optional(),
  label: z.string().optional(),
  mapIcon: z.string().optional(),
  mapIconUploader: z.string().optional(),
  listIcon: z.string().optional(),
  editableByUser: z.boolean().optional(),
  canComment: z.boolean().optional(),
});

export default function ProjectStatusEdit() {
  const router = useRouter();
  const { project, status } = router.query;
  const { data, isLoading, updateStatus } = useStatus(
    project as string,
    status as string
  );

  const defaults = useCallback(
    () => ({
      name: data?.name || null,
      seqnr: data?.seqnr || null,
      addToNewResources: data?.addToNewResources || false,
      backgroundColor: data?.backgroundColor || undefined,
      color: data?.color || undefined,
      label: data?.label || undefined,
      mapIcon: data?.mapIcon || undefined,
      mapIconUploader: '',
      listIcon: data?.listIcon || undefined,
      editableByUser: data?.extraFunctionality?.editableByUser ?? true,
      canComment: data?.extraFunctionality?.canComment ?? true,
    }),
    [data]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const status = await updateStatus(values.name, values.seqnr, values.addToNewResources, values.backgroundColor, values.color, values.label, values.mapIcon, values.listIcon, { editableByUser: values.editableByUser, canComment: values.canComment });
    if (status) {
      toast.success('Status aangepast!');
    } else {
      toast.error('Er is helaas iets mis gegaan.')
    }
  }

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

    const colors = [
        { value: 'FFFFFF', label: 'Wit' },
        { value: '000000', label: 'Zwart' },
        { value: 'EC673E', label: 'Rood' },
        { value: '7DB47B', label: 'Groen' },
        { value: '98BFE6', label: 'Blauw' },
        { value: 'FAE065', label: 'Geel' },
        { value: 'F59A02', label: 'Oranje' },
        { value: 'B078AF', label: 'Paars' },
        { value: 'E881B0', label: 'Roze' },
        { value: 'A52A2A', label: 'Bruin' },
        { value: 'D1D1D1', label: 'Grijs' },
        { value: '00FFFF', label: 'Cyaan' },
        { value: 'FFD700', label: 'Goud' },
        { value: 'ADFF2F', label: 'Limoen' },
        { value: '4B0082', label: 'Indigo' },
        { value: '8B4513', label: 'Sienna' },
        { value: 'FA8072', label: 'Zalm' },
        { value: '20B2AA', label: 'Lichtzeegroen' },
        { value: '4682B4', label: 'Staalblauw' },
        { value: 'D3D3D3', label: 'Lichtgrijs' }
    ];

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
            name: 'Statussen',
            url: `/projects/${project}/statuses`,
          },
          {
            name: 'Status aanpassen',
            url: `/projects/${project}/statuses/${status}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Status</TabsTrigger>
              <TabsTrigger value="displaysettings">
                Weergave
              </TabsTrigger>
              <TabsTrigger value="advanced">
                Geavanceerde instellingen
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Status Aanpassen</Heading>
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
                      name="seqnr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sequence nummer</FormLabel>
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
                            Voeg deze status automatisch toe aan nieuwe resources
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
                  <Heading size="xl">Status weergave</Heading>
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
                                  <Select
                                      onValueChange={(value) => {
                                          field.onChange(value);
                                      }}
                                      value={field.value}
                                  >
                                      <FormControl>
                                          <SelectTrigger>
                                              <SelectValue placeholder="Selecteer een kleur" />
                                          </SelectTrigger>
                                      </FormControl>
                                      <SelectContent style={{height: '250px', overflow: 'auto'}}>
                                          {colors.map((color) => (
                                              <SelectItem key={color.value} value={color.value}>
                                                  <span style={{ width: '10px', height: '10px', display: 'inline-block', backgroundColor: `#${color.value}`, border: '1px solid black' ,marginRight: '8px' }}></span>{color.label}
                                              </SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
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
                                  <Select
                                      onValueChange={(value) => {
                                          field.onChange(value);
                                      }}
                                      value={field.value}
                                  >
                                      <FormControl>
                                          <SelectTrigger>
                                              <SelectValue placeholder="Selecteer een kleur" />
                                          </SelectTrigger>
                                      </FormControl>
                                      <SelectContent style={{height: '250px', overflow: 'auto'}}>
                                          {colors.map((color) => (
                                              <SelectItem key={color.value} value={color.value}>
                                                  <span style={{ width: '10px', height: '10px', display: 'inline-block', backgroundColor: `#${color.value}`, border: '1px solid black' ,marginRight: '8px' }}></span>{color.label}
                                              </SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
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

                  <div className="grid grid-cols-2 gap-2">
                    <ImageUploader
                      form={form}
                      fieldName="mapIconUploader"
                      imageLabel="Icoon op de kaart"
                      description="De geüploade afbeelding wordt automatisch ingesteld als de marker op de kaart voor de resource die aan deze status is gekoppeld. De ideale afmetingen voor een icoon zijn 30x40 pixels. Het ideale type is een .png of .svg"
                      allowedTypes={['image/*']}
                      onImageUploaded={(imageResult) => {
                        const result = typeof (imageResult.url) !== 'undefined' ? imageResult.url : '';
                        form.setValue('mapIcon', result);
                        form.resetField('mapIconUploader');
                        form.trigger('mapIcon');
                      }}
                    />
                    <div className="space-y-2 col-span-full md:col-span-1 flex flex-col">
                      {!!form.watch('mapIcon') && (
                        <>
                          <label
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Geüpload icoon</label>
                          <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                                <div className="relative">
                                  <img src={form.watch('mapIcon')} alt=""/>
                                  <Button
                                    color="red"
                                    onClick={() => {
                                      form.setValue('mapIcon', '');
                                    }}
                                    className="absolute right-0 top-0">
                                    <X size={24}/>
                                  </Button>
                                </div>
                          </section>
                        </>
                      )}
                    </div>
                  </div>

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
                    <Button className="w-fit col-span-full" type="submit">
                      Opslaan
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Status functies</Heading>
                  <Separator className="my-4" />
                  <p>Op basis van de statuses van een resource kunnen functies aan en uit staan</p>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-1/2 grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="editableByUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Resource kan worden bewerkt door de gebruiker
                          </FormLabel>
                          <Select
                            onValueChange={(value) => {
                                let val = value == 'true' ? true : false
                                field.onChange(val);
                              }}
                            value={field.value ? 'true' : 'false'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="" />
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
                      name="canComment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Er kan worden gereageerd op de resource
                          </FormLabel>
                          <Select
                            onValueChange={(value) => {
                                let val = value == 'true' ? true : false
                                field.onChange(val);
                              }}
                            value={field.value ? 'true' : 'false'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="" />
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
