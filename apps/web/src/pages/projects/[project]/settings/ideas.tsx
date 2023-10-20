import * as React from 'react';
import { useEffect } from 'react';
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';

const formSchema = z.object({
  canAddNewIdeas: z.boolean(),
  minimumYesVotes: z.coerce.number(),
  titleMinLength: z.coerce.number(),
  titleMaxLength: z.coerce.number(),
  summaryMinLength: z.coerce.number(),
  summaryMaxLength: z.coerce.number(),
  descriptionMinLength: z.coerce.number(),
  descriptionMaxLength: z.coerce.number(),
});

export default function ProjectSettingsIdeas() {
  const category = 'ideas';

  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading, updateProject } = useProject();
  const defaults = () => ({
    canAddNewIdeas: data?.config?.[category]?.canAddNewIdeas || null,
    minimumYesVotes: data?.config?.[category]?.minimumYesVotes || null,
    titleMinLength: data?.config?.[category]?.titleMinLength || null,
    titleMaxLength: data?.config?.[category]?.titleMaxLength || null,
    summaryMinLength: data?.config?.[category]?.summaryMinLength || null,
    summaryMaxLength: data?.config?.[category]?.summaryMaxLength || null,
    descriptionMinLength:
      data?.config?.[category]?.descriptionMinLength || null,
    descriptionMaxLength:
      data?.config?.[category]?.descriptionMaxLength || null,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [data?.config]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateProject({
        [category]: {
          canAddNewIdeas: values.canAddNewIdeas,
          minimumYesVotes: values.minimumYesVotes,
          titleMinLength: values.titleMinLength,
          titleMaxLength: values.titleMaxLength,
          summaryMinLength: values.summaryMinLength,
          summaryMaxLength: values.summaryMaxLength,
          descriptionMinLength: values.descriptionMinLength,
          descriptionMaxLength: values.descriptionMaxLength,
        },
      });
    } catch (error) {
      console.error('could not update', error);
    }
  }

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
            url: `/projects/${project}/settings`,
          },
          {
            name: 'Ideeën',
            url: `/projects/${project}/settings/ideas`,
          },
        ]}>
        <div className="container mx-auto py-10 w-1/2 float-left">
          <Form {...form}>
            <Heading size="xl" className="mb-4">
              Instellingen • Ideeën
            </Heading>
            <Separator className="mb-4" />
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="canAddNewIdeas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Is het mogelijk om een idee in te sturen?
                    </FormLabel>
                    <Select
                      onValueChange={(e: string) =>
                        field.onChange(e === 'true')
                      }
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
              <FormField
                control={form.control}
                name="minimumYesVotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Minimum benodigde stemmen voor een idee?
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titleMinLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum lengte van titel</FormLabel>
                    <FormControl>
                      <Input placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titleMaxLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum lengte van titel</FormLabel>
                    <FormControl>
                      <Input placeholder="50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summaryMinLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum lengte van samenvatting</FormLabel>
                    <FormControl>
                      <Input placeholder="20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summaryMaxLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum lengte van samenvatting</FormLabel>
                    <FormControl>
                      <Input placeholder="140" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionMinLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum lengte van descriptie</FormLabel>
                    <FormControl>
                      <Input placeholder="140" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descriptionMaxLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum lengte van descriptie</FormLabel>
                    <FormControl>
                      <Input placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant={'default'}>
                Opslaan
              </Button>
            </form>
            <br />
          </Form>
          <Card>
            <CardHeader>
              <CardTitle>Stel hier een email op.</CardTitle>
            </CardHeader>
            <CardContent>
              <form>
                <div>
                  <div>
                    <Label>Type mail:</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thanks">Bedank-mail</SelectItem>
                        <SelectItem value="submit">
                          Opleveren van concept-plan
                        </SelectItem>
                        <SelectItem value="publish">
                          Uitbrengen van concept-plan
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Vanaf adres:</Label>
                    <Input id="mail" placeholder="email@example.com" />
                  </div>
                  <div>
                    <Label>Onderwerp:</Label>
                    <Input id="subject" placeholder="Onderwerp van de mail" />
                  </div>
                  <div>
                    <Label>Mail-template:</Label>
                    <Textarea id="template" placeholder="Inhoud van de mail" />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant={'default'}>Opslaan</Button>
            </CardFooter>
          </Card>
        </div>
      </PageLayout>
    </div>
  );
}
