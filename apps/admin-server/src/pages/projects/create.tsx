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
  useRegisterFormSave,
  useSaveController,
} from '@/components/ui/save-controller';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useProject } from '@/hooks/use-project';
import { zodResolver } from '@hookform/resolvers/zod';
import router from 'next/router';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
  projectName: z.string().min(6, {
    message: 'Het project moet minimaal uit zes karakters bestaan!',
  }),
});

const importFormSchema = z.object({
  importedProjectName: z.string().min(6, {
    message: 'Het project moet minimaal uit zes karakters bestaan!',
  }),
});

export default function CreateProject() {
  const { createProject, importProject } = useProject();
  const [file, setFile] = React.useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  const importForm = useForm<z.infer<typeof importFormSchema>>({
    resolver: zodResolver<any>(importFormSchema),
    defaultValues: {},
  });

  function handleChange(e: any) {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = (e) => {
      if (typeof e?.target?.result === 'string') {
        setFile(e.target?.result);
      }
    };
  }

  const { allowNextNavigation } = useSaveController();

  const save = React.useCallback(async () => {
    const valid = await form.trigger();
    if (!valid) {
      throw new Error('Controleer de gemarkeerde velden.');
    }
    const values = formSchema.parse(form.getValues());

    const project = await createProject(values.projectName);

    if (project && project?.status === 500) {
      throw new Error('Je hebt geen toegang tot deze actie.');
    }
    if (!project) {
      throw new Error('Er is helaas iets mis gegaan.');
    }

    // A freshly created record is not an unsaved edit, so leaving this page
    // must not prompt.
    allowNextNavigation();
    toast.success('Project aangemaakt!');
    const projectId = project?.id || project;
    router.push(`/projects/${projectId}/settings`);
  }, [form, createProject, router, allowNextNavigation]);

  // Only the create form registers. The JSON import below stays a one-shot
  // action with its own button: it is not an edit the bar can hold.
  useRegisterFormSave(form, save, { label: 'Aanmaken' });

  async function onImport(values: z.infer<typeof importFormSchema>) {
    try {
      const data = JSON.parse(file);
      const project = await importProject(
        values.importedProjectName,
        data.title,
        data.config,
        data.emailConfig
      );
      if (project) {
        // The create form above is registered, so a typed project name
        // makes the page dirty; importing is a save too, not an abandon.
        allowNextNavigation();
        toast.success('Project aangemaakt!');
        router.push(`/projects/${project.id}/settings`);
      } else {
        toast.error('De file die geüpload is bevat onjuiste data.');
      }
    } catch (e) {
      toast.error('Alleen JSON files worden geaccepteerd!');
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
        ]}>
        <div className="container py-6">
          <Form {...form} className="p-6 bg-white rounded-md">
            <Heading size="xl">Project toevoegen</Heading>
            <Separator className="my-4" />
            <form
              onSubmit={(event) => event.preventDefault()}
              className="lg:w-2/3 grid grid-cols-1 lg:grid-cols-1 gap-x-4 gap-y-8">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projectnaam</FormLabel>
                    <FormControl>
                      <Input placeholder="Naam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <Form {...importForm} className="p-6 bg-white rounded-md mt-4">
            <Heading size="xl" className="mb-4">
              Importeer project
            </Heading>
            <Separator className="mb-4" />
            <form
              onSubmit={importForm.handleSubmit(onImport)}
              className="lg:w-2/3 grid grid-cols-1 gap-x-4 gap-y-8">
              <FormField
                control={importForm.control}
                name="importedProjectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projectnaam</FormLabel>
                    <FormControl>
                      <Input placeholder="Naam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Input type="file" onChange={handleChange} />
              <Button variant="default" type="submit" className="w-fit">
                Importeren
              </Button>
            </form>
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
