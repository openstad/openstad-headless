import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';

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
import { Textarea } from '@/components/ui/textarea';
import Prism from 'prismjs';

const formSchema = z.object({
  cssUrl: z.string().optional(),
  cssCustom: z.string().optional(),
});

export default function ProjectSettingsDesign() {

  const router = useRouter();
  const { project } = router.query;
  const { data, updateProject } = useProject();

  const defaults = useCallback(
    () => {
      return {
        cssUrl: data?.config?.project?.cssUrl || '',
        cssCustom: data?.config?.project?.cssCustom || '',

      }
    },
    [data]
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
        project: {
          cssUrl: values.cssUrl,
          cssCustom: values.cssCustom,
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




  const { watch } = form;
  const fieldValue = watch('cssCustom');

  useEffect(() => {
    update(fieldValue as any);
  }, [fieldValue]);


  const update = (text: string) => {
    let result_element = document.querySelector("#highlighting-content");
    if (result_element) {
      if (text[text.length - 1] === "\n") {
        text += " ";
      }

      result_element.innerHTML = text.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;");
      Prism.highlightElement(result_element);
    }
  }

  const sync_scroll = (element: HTMLElement) => {
    const result = document.querySelector("#highlighting") as HTMLElement | null;
    if (result) {
      result.scrollTop = element.scrollTop;
      result.scrollLeft = element.scrollLeft;
    }
  }

  const check_tab = (element: HTMLTextAreaElement, event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    let code = element.value;
    if (event.key == "Tab") {
      event.preventDefault();
      let before_tab = code.slice(0, element.selectionStart);
      let after_tab = code.slice(element.selectionEnd, element.value.length);
      let cursor_pos = element.selectionStart + 1;
      element.value = before_tab + "\t" + after_tab;
      element.selectionStart = cursor_pos;
      element.selectionEnd = cursor_pos;
      update(element.value);
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
            name: 'Vormgeving',
            url: `/projects/${project}/settings/design`,
          },
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Vormgeving</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-5/6 grid grid-cols-1 lg:grid-cols-1 gap-x-4 gap-y-8">

              <FormField
                control={form.control}
                name="cssUrl"
                render={({ field }) => (
                  <FormItem className="col-span-full md:col-span-1 flex flex-col">
                    <FormLabel>Geef de URL voor de huisstijl op (css bestand)</FormLabel>
                    <FormControl>
                      <Input placeholder="Url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cssCustom"
                render={({ field }) => (
                  <FormItem className="col-span-full md:col-span-1 flex flex-col">
                    <FormLabel>Schrijf hier je eigen css</FormLabel>
                    <FormControl>
                      <div className="editor">
                        <Textarea id="editing" placeholder="Schrijf hier je custom css..." spellCheck="false" onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          update(e.target.value)
                          sync_scroll(e.target)
                        }}
                          onScroll={(e) => sync_scroll(e.target as HTMLElement)}
                          onKeyDown={(event) => check_tab(event.target as HTMLTextAreaElement, event)}
                          {...field} />

                        <pre id="highlighting" aria-hidden="true">
                          <code className="language-css" id="highlighting-content">
                          </code>
                        </pre>
                      </div>
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
