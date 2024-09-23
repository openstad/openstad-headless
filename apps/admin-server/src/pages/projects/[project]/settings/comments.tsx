import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProject } from '../../../../hooks/use-project';
import toast from 'react-hot-toast';
import * as Switch from '@radix-ui/react-switch';
import InfoDialog from '@/components/ui/info-hover';

const formSchema = z.object({
  canComment: z.boolean().optional(),
  closedText: z.string().optional(),
  canReply: z.boolean().optional(),
  canLike: z.boolean().optional(),
  descriptionMinLength: z.coerce.number().gt(0).optional(),
  descriptionMaxLength: z.coerce.number().gt(0).optional(),
  adminLabel: z.string().optional(),
});

export default function ProjectSettingsComments() {

  const router = useRouter();
  const { project } = router.query;
  const { data, updateProject } = useProject();

  const [showCommentSettings, setShowCommentSettings] = useState(false);

  const defaults = useCallback(
    () => ({
      canComment: data?.config?.comments?.canComment,
      closedText: data?.config?.comments?.closedText,
      canReply: data?.config?.comments?.canReply,
      canLike: data?.config?.comments?.canLike,
      descriptionMinLength: data?.config?.comments?.descriptionMinLength,
      descriptionMaxLength: data?.config?.comments?.descriptionMaxLength,
      adminLabel: data?.config?.comments?.adminLabel,
    }),
    [data]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
    setShowCommentSettings(data?.config?.comments?.canComment)
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await updateProject({
        comments: {
          canComment: values.canComment,
          closedText: values.closedText,
          canReply: values.canReply,
          canLike: values.canLike,
          descriptionMinLength: values.descriptionMinLength,
          descriptionMaxLength: values.descriptionMaxLength,
          adminLabel: values.adminLabel,
        },
      },
      );
      if (project) {
        toast.success('Project aangepast!');
      } else {
        toast.error('Er is helaas iets mis gegaan.')
      }
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
            url: `'/projects/${project}/settings'`,
          },
          {
            name: 'Reacties',
            url: `/projects/${project}/settings/comments`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Reacties</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-5/6 grid grid-cols-1 lg:grid-cols-1 gap-x-4 gap-y-8">

              <FormField
                control={form.control}
                name="canComment"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>
                      Is het mogelijk om reacties te plaatsen?
                    </FormLabel>
                    <Switch.Root
                      className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                      onCheckedChange={(e: boolean) => {
                        field.onChange(e);
                        setShowCommentSettings(e);
                      }}
                      checked={field.value}>
                      <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                    </Switch.Root>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showCommentSettings ? (
                <>

                  <FormField
                    control={form.control}
                    name="canReply"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>
                          Is het mogelijk om op reacties te reageren?
                        </FormLabel>
                        <Switch.Root
                          className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                          onCheckedChange={(e: boolean) => {
                            field.onChange(e);
                          }}
                          checked={field.value}>
                          <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                        </Switch.Root>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canLike"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>
                          Is het mogelijk om reacties te liken?
                        </FormLabel>
                        <Switch.Root
                          className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                          onCheckedChange={(e: boolean) => {
                            field.onChange(e);
                          }}
                          checked={field.value}>
                          <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                        </Switch.Root>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descriptionMinLength"
                    render={({ field }) => (
                      <FormItem className="col-span-full md:col-span-1 flex flex-col">
                        <FormLabel>Minimaal aantal karakters dat een bezoeker moet invoeren bij een reactie</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descriptionMaxLength"
                    render={({ field }) => (
                      <FormItem className="col-span-full md:col-span-1 flex flex-col">
                        <FormLabel>Maximaal aantal karakters dat een bezoeker mag invoeren bij een reactie</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </>
              ) : (

                <FormField
                  control={form.control}
                  name="closedText"
                  render={({ field }) => (
                    <FormItem className="col-span-full md:col-span-1 flex flex-col">
                      <FormLabel>Tekst &apos;U kunt nu niet reageren&apos;</FormLabel>
                      <FormControl>
                        <Input placeholder="typ een tekst" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              )}

              <FormField
                control={form.control}
                name="adminLabel"
                render={({ field }) => (
                  <FormItem className="col-span-full md:col-span-1 flex flex-col">


                      <FormLabel>Label bij reacties van beheerders
                        <InfoDialog content={`Dit is de beschrijving die achter de gebruikersnaam van de beheerder komt te staan. Bijvoorbeeld 'webredactie'.`} />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="typ een tekst" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <Button type="submit" className="w-fit col-span-full">
                Opslaan
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
