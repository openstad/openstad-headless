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
  useRegisterFormSave,
  validateForSave,
} from '@/components/ui/save-controller';
import { Heading } from '@/components/ui/typography';
import useAdminProjectId from '@/hooks/use-admin-project-id';
import useGlobalSettings from '@/hooks/use-global-settings';
import { useSyncFormDefaults } from '@/hooks/useSyncFormDefaults';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  logo: z.string().optional(),
  imageLogo: z.string().optional(),
  favicon: z.string().optional(),
  imageFavicon: z.string().optional(),
  accentColor: z.union([
    z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Kies een kleur, bijvoorbeeld #00325F'),
    z.literal(''),
  ]),
});

type ImageField = {
  name: 'logo' | 'favicon';
  uploadField: 'imageLogo' | 'imageFavicon';
  label: string;
};

const IMAGE_FIELDS: ImageField[] = [
  { name: 'logo', uploadField: 'imageLogo', label: 'Logo' },
  { name: 'favicon', uploadField: 'imageFavicon', label: 'Favicon' },
];

export function GlobalBrandingForm() {
  const { data, updateGlobalSettings } = useGlobalSettings();
  const adminProjectId = useAdminProjectId();

  const defaults = useCallback(
    () => ({
      logo: data?.branding?.logo || '',
      imageLogo: '',
      favicon: data?.branding?.favicon || '',
      imageFavicon: '',
      accentColor: data?.branding?.accentColor || '',
    }),
    [data?.branding]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useSyncFormDefaults(form, defaults, data);

  const save = useCallback(async () => {
    const valid = await validateForSave(form);
    if (!valid) {
      throw new Error('Controleer de gemarkeerde velden.');
    }
    const values = formSchema.parse(form.getValues());
    await updateGlobalSettings({
      branding: {
        logo: values.logo || '',
        favicon: values.favicon || '',
        accentColor: values.accentColor || '',
      },
    });
  }, [form, updateGlobalSettings]);

  useRegisterFormSave(form, save);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Branding</Heading>
        <p className="mt-2 text-sm text-muted-foreground lg:w-1/2">
          Nieuwe projecten krijgen dit logo en deze favicon op de inlogpagina en
          in de e-mails, en deze accentkleur in de e-mails. Bestaande projecten
          veranderen niet. Een project kan deze waarden in de eigen instellingen
          aanpassen.
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {IMAGE_FIELDS.map(({ name, uploadField, label }) => {
            const imageUrl = form.watch(name);
            return (
              <div key={name} className="flex flex-col gap-2">
                <ImageUploader
                  form={form}
                  project={adminProjectId ? String(adminProjectId) : undefined}
                  imageLabel={label}
                  fieldName={uploadField}
                  allowedTypes={['image/*']}
                  onImageUploaded={(imageResult) => {
                    const result =
                      typeof imageResult.url !== 'undefined'
                        ? imageResult.url
                        : '';
                    form.setValue(name, result, { shouldDirty: true });
                    form.resetField(uploadField);
                  }}
                />
                {!!imageUrl && (
                  <div className="relative w-fit">
                    <img src={imageUrl} alt={label} className="max-h-24" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      aria-label={`${label} verwijderen`}
                      className="absolute right-0 top-0"
                      onClick={() =>
                        form.setValue(name, '', { shouldDirty: true })
                      }>
                      <X size={16} />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          <FormField
            control={form.control}
            name="accentColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accentkleur van de e-mails</FormLabel>
                <FormDescription>
                  Knoppen en titels in de e-mails krijgen deze kleur.
                </FormDescription>
                <FormControl>
                  <div>
                    <ColorPicker
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
}
