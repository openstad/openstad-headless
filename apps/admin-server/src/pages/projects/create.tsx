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
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useProject } from '@/hooks/use-project';
import useTemplates, { ProjectTemplate } from '@/hooks/use-template';
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

const templateFormSchema = z.object({
  templateProjectName: z.string().min(6, {
    message: 'Het project moet minimaal uit zes karakters bestaan!',
  }),
  templateId: z.string().min(1, {
    message: 'Kies een template!',
  }),
});

export default function CreateProject() {
  const { createProject, importProject } = useProject();
  const { data: templates } = useTemplates();
  const [file, setFile] = React.useState('');
  const [templateCreating, setTemplateCreating] = React.useState(false);
  const [templateErrors, setTemplateErrors] = React.useState<
    Array<{ step: string; error: string }>
  >([]);
  const [duplicatedData, setDuplicatedData] = React.useState<any>({});
  const [removingDuplicatedData, setRemovingDuplicatedData] =
    React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {},
  });

  const importForm = useForm<z.infer<typeof importFormSchema>>({
    resolver: zodResolver<any>(importFormSchema),
    defaultValues: {},
  });

  const templateForm = useForm<z.infer<typeof templateFormSchema>>({
    resolver: zodResolver<any>(templateFormSchema),
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const project = await createProject(values.projectName);

    if (project && project?.status === 500) {
      toast.error('Je hebt geen toegang tot deze actie.');
      return;
    }

    if (project) {
      toast.success('Project aangemaakt!');
      const projectId = project?.id || project;

      router.push(`/projects/${projectId}/settings`);
    } else {
      toast.error('Er is helaas iets mis gegaan.');
    }
  }

  async function onCreateFromTemplate(
    values: z.infer<typeof templateFormSchema>
  ) {
    const template = (templates || []).find(
      (t: ProjectTemplate) => String(t.id) === values.templateId
    );
    if (!template) {
      toast.error('Kies een template!');
      return;
    }

    setTemplateCreating(true);
    setTemplateErrors([]);
    setDuplicatedData({});

    try {
      const response = await fetch('/api/openstad/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...template.data,
          name: values.templateProjectName,
          isDuplicateRequest: true,
        }),
      });

      if (!response.ok) {
        const responseJSON = await response.json();
        setTemplateErrors(
          responseJSON.errors || [
            {
              step: 'Project aanmaken vanuit template',
              error: 'Er is een fout opgetreden.',
            },
          ]
        );
        setDuplicatedData(responseJSON.duplicatedData || {});
        toast.error(
          'Er is een fout opgetreden bij het aanmaken van het project.'
        );
        return;
      }

      const newId = await response.json();
      toast.success('Project aangemaakt!');
      if (newId) {
        router.push(`/projects/${newId}/widgets`);
      }
    } catch (error) {
      setTemplateErrors([
        {
          step: 'Project aanmaken vanuit template',
          error: 'Netwerkfout of ongeldig antwoord van de server.',
        },
      ]);
      toast.error(
        'Er is een fout opgetreden bij het aanmaken van het project.'
      );
    } finally {
      setTemplateCreating(false);
    }
  }

  async function removeDuplicatedData() {
    setRemovingDuplicatedData(true);
    try {
      const response = await fetch(
        '/api/openstad/api/project/delete-duplicated-data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...duplicatedData }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete duplicated data');
      }

      toast.success('Het mislukte project en bijbehorende data is verwijderd.');
      setTemplateErrors([]);
      setDuplicatedData({});
    } catch (error) {
      toast.error(
        'Verwijderen niet gelukt. Neem contact op met de beheerders.'
      );
    } finally {
      setRemovingDuplicatedData(false);
    }
  }

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
              onSubmit={form.handleSubmit(onSubmit)}
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
              <Button variant="default" type="submit" className="w-fit">
                Opslaan
              </Button>
            </form>
          </Form>
          {Array.isArray(templates) && templates.length > 0 && (
            <Form {...templateForm} className="p-6 bg-white rounded-md mt-4">
              <Heading size="xl" className="mb-4">
                Project aanmaken vanuit template
              </Heading>
              <Separator className="mb-4" />
              <form
                onSubmit={templateForm.handleSubmit(onCreateFromTemplate)}
                className="lg:w-2/3 grid grid-cols-1 gap-x-4 gap-y-8">
                <FormField
                  control={templateForm.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template</FormLabel>
                      <FormControl>
                        <select
                          className="px-4 py-2.5 text-sm rounded-md border border-border bg-white w-full"
                          {...field}
                          value={field.value || ''}>
                          <option value="" disabled>
                            Kies een template
                          </option>
                          {templates.map((template: ProjectTemplate) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={templateForm.control}
                  name="templateProjectName"
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
                <Button
                  variant="default"
                  type="submit"
                  className="w-fit"
                  disabled={templateCreating}>
                  {templateCreating ? 'Bezig met aanmaken' : 'Aanmaken'}
                </Button>
              </form>
              {templateErrors.length > 0 && (
                <div className="mt-4">
                  <Separator className="my-4" />
                  <p>
                    Het aanmaken is mislukt en de data is mogelijk deels
                    aangemaakt. Klik op de knop hieronder om deze te
                    verwijderen.
                  </p>
                  <ul className="mt-2 text-red-600">
                    {templateErrors.map((error, index) => (
                      <li key={index}>{`${error.step} - ${error.error}`}</li>
                    ))}
                  </ul>
                  <Button
                    variant="default"
                    className="mt-4"
                    disabled={removingDuplicatedData}
                    onClick={() => removeDuplicatedData()}>
                    {removingDuplicatedData
                      ? 'Bezig met verwijderen'
                      : 'Verwijder mislukt project'}
                  </Button>
                </div>
              )}
            </Form>
          )}
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
