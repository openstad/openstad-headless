import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import {
  useRegisterFormSave,
  useSaveController,
} from '@/components/ui/save-controller';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import projectListSwr from '@/hooks/use-project-list';
import useUsers from '@/hooks/use-users';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Geen geldig e-mailadres'),
  projectId: z.string(),
});

export default function CreateUser() {
  const { createUser } = useUsers();
  const { data: projects } = projectListSwr();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  const { allowNextNavigation } = useSaveController();

  const save = useCallback(async () => {
    const valid = await form.trigger();
    if (!valid) {
      throw new Error('Controleer de gemarkeerde velden.');
    }
    const values = formSchema.parse(form.getValues());

    let user;
    try {
      user = await createUser({
        email: values.email,
        projectId: values.projectId,
      });
    } catch (err: unknown) {
      throw new Error(
        (err instanceof Error && err.message) ||
          'User kon niet worden toegevoegd'
      );
    }

    // A freshly created record is not an unsaved edit. This leaves via a full
    // page load, so the flag also has to silence the beforeunload prompt.
    toast.success('User is toegevoegd');
    user.key = `${user.idpUser.provider}-*-${user.idpUser.identifier}`;

    // Set immediately before leaving: anything that throws in between would
    // otherwise leave the guard disabled for a navigation that never happened.
    allowNextNavigation();
    document.location.href = `/users/${btoa(user.key)}`;
  }, [form, createUser, allowNextNavigation]);

  useRegisterFormSave(form, save, { label: 'Aanmaken' });
  if (!projects) return null;

  return (
    <PageLayout
      pageHeader="Gebruikers"
      breadcrumbs={[
        {
          name: 'Gebruikers',
          url: '/users',
        },
        {
          name: 'Gebruiker toevoegen',
          url: `/users/create`,
        },
      ]}>
      <div className="container py-6">
        <div className="p-6 bg-white rounded-md">
          <Form {...form}>
            <Heading size="xl">User toevoegen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={(event) => event.preventDefault()}
              className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-auto">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>E-mailadres</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormObjectSelectField
                form={form}
                fieldName="projectId"
                fieldLabel="Basisproject (Een gebruiker moet altijd één project hebben.)"
                items={projects}
                keyForValue="id"
                label={(project: any) => `${project.name}`}
                noSelection="&nbsp;"
              />
            </form>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
}
