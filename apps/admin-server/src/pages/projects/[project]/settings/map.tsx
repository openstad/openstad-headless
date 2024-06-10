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
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import toast from 'react-hot-toast';
import * as Switch from '@radix-ui/react-switch';
import InfoDialog from '@/components/ui/info-hover';
import {FormObjectSelectField} from "@/components/ui/form-object-select-field";
import useArea from "@/hooks/use-areas";

const formSchema = z.object({
  maxZoom: z.string().optional(),
  minZoom: z.string().optional(),
  areaId: z.string().optional(),
});

export default function ProjectSettingsMap() {
  const router = useRouter();
  const { project } = router.query;
  const { data, updateProject } = useProject();
  const { data: areas } = useArea(project as string);
  const [disabled, setDisabled]  = useState(false);

  const defaults = useCallback(
    () => {
      return {
        minZoom: data?.config?.map?.minZoom || '7',
        maxZoom: data?.config?.map?.maxZoom || '20',
        areaId: data?.config?.map?.areaId || '',
      }
    },
    [data, areas]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject({
        map: {
          areaId: values.areaId,
          minZoom: values.minZoom,
          maxZoom: values.maxZoom,
        },
      });
      if (project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
    } catch (error) {
      console.error('could not update', error);
    }
  }

  useEffect(() => {
    const minZoomValue = form.watch('minZoom');
    const maxZoomValue = form.watch('maxZoom');

    if ( parseInt(minZoomValue) >= parseInt(maxZoomValue) ) {
      form.setError('minZoom', {type: 'manual', message: 'Waarde kan niet hoger zijn dan het inzoom niveau'});
      form.setError('maxZoom', {type: 'manual', message: 'Waarde kan niet hoger zijn dan het uitzoom niveau'});
      setDisabled(true);
    } else {
      form.clearErrors(['minZoom', 'maxZoom'])
      setDisabled(false);
    }
  }, [ form.watch('minZoom'), form.watch('maxZoom') ] );

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
            name: 'Instellingen',
            url: '/projects/${project}/settings',
          },
          {
            name: 'Map instellingen',
            url: `/projects/${project}/settings/map`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Map instellingen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">

              <FormField
                control={form.control}
                name="minZoom"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Wat is het niveau tot hoever gebruikers mogen uitzoomen?
                      <InfoDialog content="Gebruik een waarde tussen 7 en 20 om het zoomniveau in te stellen. Bij niveau 7 is heel Nederland zichtbaar, terwijl niveau 20 het maximale detailniveau vertegenwoordigt, waarbij je kunt inzoomen tot individuele huizen." />
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="7" max="20" placeholder="7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxZoom"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Wat is het niveau tot hoever gebruikers mogen inzoomen?
                      <InfoDialog content="Gebruik een waarde tussen 7 en 20 om het zoomniveau in te stellen. Bij niveau 7 is heel Nederland zichtbaar, terwijl niveau 20 het maximale detailniveau vertegenwoordigt, waarbij je kunt inzoomen tot individuele huizen." />
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="7" max="20" placeholder="20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormObjectSelectField
                form={form}
                fieldName="areaId"
                fieldLabel="Polygon voor kaarten"
                fieldInfo="Op de pagina 'Polygonen' kun je een eigen gebied aanmaken. Selecteer hieronder het gebied waar dit project onder valt."
                items={areas}
                keyForValue="id"
                label={(area: any) => `${area.name}`}
                noSelection="&nbsp;"
              />

              <Button
                type="submit"
                className="w-fit col-span-full"
                disabled={disabled}
              >
                Opslaan
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
