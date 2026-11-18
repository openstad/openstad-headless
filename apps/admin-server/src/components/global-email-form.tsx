import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  useRegisterFormSave,
  validateForSave,
} from '@/components/ui/save-controller';
import { Heading } from '@/components/ui/typography';
import { WhitelistedEmailSelect } from '@/components/ui/whitelisted-email-select';
import useGlobalSettings from '@/hooks/use-global-settings';
import { useSyncFormDefaults } from '@/hooks/useSyncFormDefaults';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const requiredAddress = (message: string) =>
  z.string().min(1, message).email('Geen geldig e-mailadres');

const optionalAddress = z
  .union([z.string().email('Geen geldig e-mailadres'), z.literal('')])
  .optional();

const formSchema = z.object({
  loginFromAddress: requiredAddress(
    'Vul het afzenderadres van de inlogmails in'
  ),
  loginFromName: z.string().optional(),
  loginHelpAddress: optionalAddress,
  notificationsFromAddress: requiredAddress(
    'Vul het afzenderadres van de notificaties in'
  ),
  notificationsFromName: z.string().optional(),
  notificationsReplyTo: optionalAddress,
});

type FieldName = keyof z.infer<typeof formSchema>;

type FieldDefinition = {
  name: FieldName;
  label: string;
  description?: string;
  whitelisted?: boolean;
};

const SECTIONS: { title: string; fields: FieldDefinition[] }[] = [
  {
    title: 'Inlogmails',
    fields: [
      {
        name: 'loginFromAddress',
        label: 'Afzenderadres',
        whitelisted: true,
      },
      { name: 'loginFromName', label: 'Naam van de afzender' },
      {
        name: 'loginHelpAddress',
        label: 'E-mailadres voor contact en hulpvragen',
      },
    ],
  },
  {
    title: 'Notificaties',
    fields: [
      {
        name: 'notificationsFromAddress',
        label: 'Afzenderadres',
        whitelisted: true,
      },
      { name: 'notificationsFromName', label: 'Naam van de afzender' },
      {
        name: 'notificationsReplyTo',
        label: 'Reply-to adres',
        description: 'Laat leeg om antwoorden naar de afzender te laten gaan.',
      },
    ],
  },
];

export function GlobalEmailForm({
  whitelistedEmails,
}: {
  whitelistedEmails: string[];
}) {
  const { data, updateGlobalSettings } = useGlobalSettings();

  const defaults = useCallback(
    () => ({
      loginFromAddress: data?.email?.login?.fromAddress || '',
      loginFromName: data?.email?.login?.fromName || '',
      loginHelpAddress: data?.email?.login?.helpAddress || '',
      notificationsFromAddress: data?.email?.notifications?.fromAddress || '',
      notificationsFromName: data?.email?.notifications?.fromName || '',
      notificationsReplyTo: data?.email?.notifications?.replyTo || '',
    }),
    [data?.email]
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
      email: {
        login: {
          fromAddress: values.loginFromAddress,
          fromName: values.loginFromName || '',
          helpAddress: values.loginHelpAddress || '',
        },
        notifications: {
          fromAddress: values.notificationsFromAddress,
          fromName: values.notificationsFromName || '',
          replyTo: values.notificationsReplyTo || '',
        },
      },
    });
  }, [form, updateGlobalSettings]);

  useRegisterFormSave(form, save);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">E-mail instellingen</Heading>
        <p className="mt-2 text-sm text-muted-foreground lg:w-1/2">
          Nieuwe projecten krijgen deze afzenders. Bestaande projecten
          veranderen niet. Een project kan deze waarden in de eigen instellingen
          aanpassen.
        </p>
        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          {SECTIONS.map(({ title, fields }) => (
            <div key={title} className="grid gap-6 content-start">
              <Heading size="lg">{title}</Heading>
              {fields.map(({ name, label, description, whitelisted }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      {description && (
                        <FormDescription>{description}</FormDescription>
                      )}
                      <FormControl>
                        {whitelisted && whitelistedEmails.length > 0 ? (
                          <WhitelistedEmailSelect
                            field={field}
                            whitelistedEmails={whitelistedEmails}
                          />
                        ) : (
                          <Input placeholder="" {...field} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </Form>
    </div>
  );
}
