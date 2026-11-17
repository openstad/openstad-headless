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
import useMailStyling from '@/hooks/use-mail-styling';
import { useProject } from '@/hooks/use-project';
import { useSyncFormDefaults } from '@/hooks/useSyncFormDefaults';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  logo: z.string().optional(),
  imageLogo: z.string().optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Kies een kleur, bijvoorbeeld #00325F'),
});

export function NotificationStylingForm({ project }: { project: string }) {
  const { data, updateProjectEmails } = useProject();
  const { mutate: refreshMailStyling } = useMailStyling(project);

  const defaults = useCallback(
    () => ({
      logo: data?.emailConfig?.styling?.logo || '',
      imageLogo: '',
      accentColor: data?.emailConfig?.styling?.accentColor || '',
    }),
    [data?.emailConfig]
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
    const result = await updateProjectEmails({
      styling: {
        logo: values.logo || '',
        accentColor: values.accentColor,
      },
    });
    if (!result) {
      throw new Error('Er is helaas iets mis gegaan.');
    }
    await refreshMailStyling();
  }, [form, updateProjectEmails, refreshMailStyling]);

  useRegisterFormSave(form, save);

  const logo = form.watch('logo');

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Huisstijl van de e-mails</Heading>
        <p className="mt-2 text-sm text-muted-foreground lg:w-1/2">
          Het logo en de accentkleur gelden voor alle e-mails van dit project.
          Stel je hier geen logo in, dan gebruiken we het logo van de
          inlogpagina, en anders het logo van het project. Is er nergens een
          logo, dan staat er geen logo in de e-mail.
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <ImageUploader
              form={form}
              project={project}
              imageLabel="Logo voor de e-mails"
              fieldName="imageLogo"
              allowedTypes={['image/*']}
              onImageUploaded={(imageResult) => {
                const result =
                  typeof imageResult.url !== 'undefined' ? imageResult.url : '';
                form.setValue('logo', result, { shouldDirty: true });
                form.resetField('imageLogo');
              }}
            />
            {!!logo && (
              <div className="relative w-fit">
                <img
                  src={logo}
                  alt="Logo voor de e-mails"
                  className="max-h-24"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label="Logo verwijderen"
                  className="absolute right-0 top-0"
                  onClick={() =>
                    form.setValue('logo', '', { shouldDirty: true })
                  }>
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>
          <FormField
            control={form.control}
            name="accentColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accentkleur</FormLabel>
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
