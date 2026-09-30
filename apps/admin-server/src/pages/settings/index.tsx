import { WithApiUrlProps } from '@/lib/server-side-props-definition';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { ImageUploader } from '../../components/image-uploader';
import { NotificationSettings } from '../../components/notification-settings';
import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { PageLayout } from '../../components/ui/page-layout';
import { Separator } from '../../components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { Heading } from '../../components/ui/typography';
import { useGlobalSettings } from '../../hooks/use-global-settings';
import { ADMIN_PROJECT_ID } from '../../lib/admin-project';
import { GLOBAL_NOTIFICATION_SCOPE } from '../../lib/notification-scope';
import ProjectTags from '../projects/[project]/tags';

function BrandingTab() {
  const { data, updateGlobalSettings } = useGlobalSettings();

  const formSchema = z.object({
    imageLogo: z.string().optional(),
    logo: z.string().optional(),
    imageFavicon: z.string().optional(),
    favicon: z.string().optional(),
  });

  const defaults = useCallback(
    () => ({
      logo: data?.config?.styling?.logo || '',
      favicon: data?.config?.styling?.favicon || '',
    }),
    [data?.config]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { ok, data: result } = await updateGlobalSettings({
      config: {
        styling: {
          logo: values.logo || '',
          favicon: values.favicon || '',
        },
      },
    });

    if (ok) {
      toast.success('Algemene instellingen aangepast!');
    } else {
      toast.error(
        result?.errors?.join(', ') || 'Er is helaas iets mis gegaan.'
      );
    }
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Branding</Heading>
        <p className="text-gray-500">
          Dit logo en favicon worden automatisch toegepast op nieuwe projecten.
          Een project kan dit in de eigen instellingen overschrijven.
        </p>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 lg:w-fit">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ImageUploader
              form={form}
              project={ADMIN_PROJECT_ID}
              imageLabel="Upload hier het standaard logo voor nieuwe projecten"
              fieldName="imageLogo"
              allowedTypes={['image/*']}
              onImageUploaded={(imageResult) => {
                const result =
                  typeof imageResult.url !== 'undefined' ? imageResult.url : '';
                form.setValue('logo', result);
                form.resetField('imageLogo');
                form.trigger('logo');
              }}
            />
            <ImageUploader
              form={form}
              project={ADMIN_PROJECT_ID}
              imageLabel="Upload hier het standaard favicon voor nieuwe projecten"
              fieldName="imageFavicon"
              allowedTypes={['image/*']}
              onImageUploaded={(imageResult) => {
                const result =
                  typeof imageResult.url !== 'undefined' ? imageResult.url : '';
                form.setValue('favicon', result);
                form.resetField('imageFavicon');
                form.trigger('favicon');
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {!!form.watch('logo') && (
              <div className="flex flex-col gap-2">
                <FormLabel>Geüploade logo</FormLabel>
                <img src={form.watch('logo')} alt="logo" className="max-h-24" />
              </div>
            )}
            {!!form.watch('favicon') && (
              <div className="flex flex-col gap-2">
                <FormLabel>Geüploade favicon</FormLabel>
                <img
                  src={form.watch('favicon')}
                  alt="favicon"
                  className="max-h-24"
                />
              </div>
            )}
          </div>

          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}

function EmailTab() {
  const { data, updateGlobalSettings } = useGlobalSettings();

  const formSchema = z.object({
    loginFromAddress: z
      .string()
      .email({ message: 'Vul een geldig e-mailadres in' }),
    loginFromName: z.string().optional(),
    loginHelpAddress: z
      .string()
      .email({ message: 'Vul een geldig e-mailadres in' })
      .optional()
      .or(z.literal('')),
    notificationsFromAddress: z
      .string()
      .email({ message: 'Vul een geldig e-mailadres in' }),
    notificationsFromName: z.string().optional(),
    notificationsReplyTo: z
      .string()
      .email({ message: 'Vul een geldig e-mailadres in' }),
  });

  const defaults = useCallback(
    () => ({
      loginFromAddress: data?.emailConfig?.login?.fromAddress || '',
      loginFromName: data?.emailConfig?.login?.fromName || '',
      loginHelpAddress: data?.emailConfig?.login?.helpAddress || '',
      notificationsFromAddress:
        data?.emailConfig?.notifications?.fromAddress || '',
      notificationsFromName: data?.emailConfig?.notifications?.fromName || '',
      notificationsReplyTo: data?.emailConfig?.notifications?.replyTo || '',
    }),
    [data?.emailConfig]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { ok, data: result } = await updateGlobalSettings({
      emailConfig: {
        login: {
          fromAddress: values.loginFromAddress,
          fromName: values.loginFromName || '',
          helpAddress: values.loginHelpAddress || '',
        },
        notifications: {
          fromAddress: values.notificationsFromAddress,
          fromName: values.notificationsFromName || '',
          replyTo: values.notificationsReplyTo,
        },
      },
    });

    if (ok) {
      toast.success('Algemene instellingen aangepast!');
    } else {
      toast.error(
        result?.errors?.join(', ') || 'Er is helaas iets mis gegaan.'
      );
    }
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">E-mail instellingen</Heading>
        <p className="text-gray-500">
          Deze instellingen worden automatisch toegepast op nieuwe projecten.
          Een project kan dit in de eigen instellingen overschrijven.
        </p>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-fit grid grid-cols-1 gap-6">
          <Heading size="lg">Login e-mails</Heading>

          <FormField
            control={form.control}
            name="loginFromAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Afzender e-mailadres van login e-mails</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loginFromName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Afzender naam van login e-mails</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loginHelpAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mailadres voor hulpvragen bij inloggen</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="my-2" />
          <Heading size="lg">Notificatie e-mails</Heading>

          <FormField
            control={form.control}
            name="notificationsFromAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Afzender e-mailadres van notificatie e-mails
                </FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notificationsFromName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Afzender naam van notificatie e-mails</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notificationsReplyTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Antwoordadres (reply-to) van notificatie e-mails
                </FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}

export default function GlobalSettings({ apiUrl }: WithApiUrlProps) {
  return (
    <div>
      <PageLayout
        pageHeader="Algemene instellingen"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Instellingen',
            url: `/projects/settings`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="display">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="display">Tags</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="email">E-mail instellingen</TabsTrigger>
              <TabsTrigger value="notifications">
                Notificaties en e-mails
              </TabsTrigger>
            </TabsList>
            <TabsContent value="display" className="p-0">
              <ProjectTags preset="global" />
            </TabsContent>
            <TabsContent value="branding" className="p-0">
              <BrandingTab />
            </TabsContent>
            <TabsContent value="email" className="p-0">
              <EmailTab />
            </TabsContent>
            <TabsContent value="notifications" className="p-0">
              <NotificationSettings scope={GLOBAL_NOTIFICATION_SCOPE} />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
