/**
 * Brand style for every notification mail of a project: logo and the three
 * colours the generated layout uses.
 *
 * The colours are baked into `notification_template.body` at generation time,
 * so saving here also regenerates the body of every content-managed template.
 * Templates whose HTML is managed by hand (content = NULL) are left alone.
 */
import ColorPicker from '@/components/colorpicker';
import { ImageUploader } from '@/components/image-uploader';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { useGlobalSettings } from '@/hooks/use-global-settings';
import useNotificationTemplate from '@/hooks/use-notification-template';
import { useProject } from '@/hooks/use-project';
import { ADMIN_PROJECT_ID } from '@/lib/admin-project';
import {
  DEFAULT_STYLING,
  NotificationStyling,
  NotificationType,
  hasContent,
  isPlainTextType,
  normalizeContent,
  renderNotificationMjml,
  resolveInheritedStyling,
} from '@/lib/notification-content';
import {
  NotificationScope,
  isGlobalScope,
  projectNotificationScope,
} from '@/lib/notification-scope';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
  message: 'Gebruik een hexkleur, zoals #00325F',
});

const formSchema = z.object({
  logo: z.string(),
  // Only used by the uploader input itself, never stored.
  imageLogo: z.string().optional(),
  primaryColor: hexColor,
  backgroundColor: hexColor,
  textColor: hexColor,
});

type FormValues = z.infer<typeof formSchema>;

/** Radix Select cannot hold an empty value, so "no logo" needs a sentinel. */
const NO_LOGO = '__default__';

function logoName(url: string): string {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.split('/').pop() || url;
}

type Props = {
  // Which templates the colour change regenerates, and where the styling is stored.
  // Defaults to the project of the current route.
  scope?: NotificationScope;
  /**
   * Fires on every edit, so the mail previews next to this form can show the
   * new brand style before it is saved.
   */
  onStylingChange?: (styling: NotificationStyling) => void;
};

export function NotificationStylingForm({ scope, onStylingChange }: Props) {
  const router = useRouter();
  const project = router.query.project as string;
  const activeScope = scope || projectNotificationScope(project);
  const globalScope = isGlobalScope(activeScope);

  const { data: projectData, updateProjectEmails } = useProject([
    'includeAuthConfig',
  ]);
  // On a project page this reads the project scoped route, which an editor may call; the
  // unscoped one is admin-only. Both are needed: a project inherits the global brand for
  // every field it left empty.
  const { data: globalSettings, updateGlobalSettings } = useGlobalSettings(
    globalScope ? undefined : project
  );
  const { data: templates, update } = useNotificationTemplate(activeScope);

  const globalStyling: NotificationStyling | undefined =
    globalSettings?.emailConfig?.styling;
  const styling = globalScope
    ? globalStyling
    : resolveInheritedStyling(projectData?.emailConfig?.styling, globalStyling);

  // The logos an admin already uploaded elsewhere in this project, so they can
  // pick one instead of pasting a URL. See /projects/[project]/authentication.
  const knownLogos: string[] = React.useMemo(() => {
    const candidates = globalScope
      ? [globalSettings?.config?.styling?.logo, styling?.logo]
      : [
          projectData?.config?.auth?.provider?.openstad?.config?.styling?.logo,
          projectData?.config?.styling?.logo,
          globalStyling?.logo,
          styling?.logo,
        ];
    return Array.from(
      new Set(
        candidates.filter(
          (url): url is string => typeof url === 'string' && url.length > 0
        )
      )
    );
  }, [
    globalScope,
    globalSettings?.config,
    globalStyling?.logo,
    projectData?.config,
    styling?.logo,
  ]);

  const defaults = useCallback(
    () => ({
      logo: styling?.logo || '',
      primaryColor: styling?.primaryColor || DEFAULT_STYLING.primaryColor,
      backgroundColor:
        styling?.backgroundColor || DEFAULT_STYLING.backgroundColor,
      textColor: styling?.textColor || DEFAULT_STYLING.textColor,
    }),
    [
      styling?.logo,
      styling?.primaryColor,
      styling?.backgroundColor,
      styling?.textColor,
    ]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  useEffect(() => {
    if (!onStylingChange) return;
    const subscription = form.watch((values) => {
      onStylingChange({
        logo: values.logo || '',
        primaryColor: values.primaryColor || DEFAULT_STYLING.primaryColor,
        backgroundColor:
          values.backgroundColor || DEFAULT_STYLING.backgroundColor,
        textColor: values.textColor || DEFAULT_STYLING.textColor,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onStylingChange]);

  /**
   * The colours live inside the stored MJML, so an existing template keeps its
   * old colours until its body is rebuilt from the content fields.
   */
  async function regenerateManagedTemplates(styling: NotificationStyling) {
    if (!Array.isArray(templates)) return 0;

    let updated = 0;
    for (const template of templates) {
      if (isPlainTextType(template.type)) continue;
      if (!hasContent(template.content)) continue;

      const content = normalizeContent(template.content);
      const body = renderNotificationMjml(
        template.type as NotificationType,
        content,
        styling
      );
      if (body === template.body) continue;

      await update(
        template.id,
        template.label,
        template.subject,
        body,
        content
      );
      updated++;
    }
    return updated;
  }

  async function onSubmit(values: FormValues) {
    const styling: NotificationStyling = {
      logo: values.logo,
      primaryColor: values.primaryColor,
      backgroundColor: values.backgroundColor,
      textColor: values.textColor,
    };

    try {
      if (globalScope) {
        const { ok } = await updateGlobalSettings({ emailConfig: { styling } });
        if (!ok) {
          toast.error('Er is helaas iets mis gegaan.');
          return;
        }
      } else {
        const updatedProject = await updateProjectEmails({ styling });
        if (!updatedProject) {
          toast.error('Er is helaas iets mis gegaan.');
          return;
        }
      }

      const updated = await regenerateManagedTemplates(styling);
      toast.success(
        updated > 0
          ? `Huisstijl opgeslagen, ${updated} e-mail(s) bijgewerkt.`
          : 'Huisstijl opgeslagen!'
      );
    } catch (error) {
      console.error('could not update the mail styling', error);
      toast.error('Er is helaas iets mis gegaan.');
    }
  }

  return (
    <div className="p-4 border rounded-md bg-white">
      <h3 className="font-futura font-bold tracking-tight text-lg">
        Huisstijl van de e-mails
      </h3>
      <p className="text-sm mt-1">
        {globalScope
          ? 'Logo en kleuren gelden voor alle e-mails hieronder. Een project met een eigen huisstijl houdt die eigen opmaak.'
          : 'Logo en kleuren gelden voor alle e-mails van dit project. E-mails waarvan je de HTML zelf beheert, houden hun eigen opmaak.'}
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <Select
                  value={field.value || NO_LOGO}
                  onValueChange={(value) =>
                    field.onChange(value === NO_LOGO ? '' : value)
                  }>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kies een logo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NO_LOGO}>
                      Standaard OpenStad-logo
                    </SelectItem>
                    {knownLogos.map((url) => (
                      <SelectItem key={url} value={url}>
                        <span className="flex items-center gap-2">
                          <img
                            src={url}
                            alt=""
                            className="h-6 w-auto max-w-[64px] object-contain"
                          />
                          {logoName(url)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {knownLogos.length > 0
                    ? "De logo's uit dit project, bijvoorbeeld die van Authenticatie. Upload hieronder een ander logo."
                    : 'Er is nog geen logo in dit project. Upload er hieronder een.'}
                </FormDescription>
                <div className="mt-2 p-2 border rounded-md bg-[#f6f6f7]">
                  <p className="text-xs text-muted-foreground mb-1">
                    Zo staat het bovenaan de e-mail:
                  </p>
                  <img
                    src={field.value || '/logo-openstad.png'}
                    alt="Gekozen logo"
                    className="max-h-16 w-auto"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <ImageUploader
            form={form}
            project={globalScope ? ADMIN_PROJECT_ID : project}
            fieldName="imageLogo"
            imageLabel="Nieuw logo uploaden"
            allowedTypes={['image/*']}
            onImageUploaded={(imageResult) => {
              form.setValue('logo', imageResult.url || '');
              form.resetField('imageLogo');
            }}
          />

          {(
            [
              ['primaryColor', 'Accentkleur', 'Knoppen en links.'],
              ['backgroundColor', 'Achtergrondkleur', 'Rondom de e-mail.'],
              ['textColor', 'Tekstkleur', 'De lopende tekst.'],
            ] as const
          ).map(([name, label, description]) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <div>
                      <ColorPicker
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>{description}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" disabled={form.formState.isSubmitting}>
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
