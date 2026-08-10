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
import {
  ExportData,
  transformExportToImport,
} from '@/lib/import-export/transform-export-to-import';
import { zodResolver } from '@hookform/resolvers/zod';
import router from 'next/router';
import * as React from 'react';
import { useState } from 'react';
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
  const { createProject } = useProject();
  const [file, setFile] = useState('');
  const [parsedData, setParsedData] = useState<ExportData | null>(null);
  const [importingInProgress, setImportingInProgress] = useState(false);
  const [errors, setErrors] = useState<Array<{ step: string; error: string }>>(
    []
  );
  const [isErrorsVisible, setIsErrorsVisible] = useState(false);
  const [duplicatedData, setDuplicatedData] = useState<any>(null);
  const [
    removePreviousDuplicatedDataInProgress,
    setRemovePreviousDuplicatedDataInProgress,
  ] = useState(false);

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
        setFile(e.target.result);
        try {
          const data = JSON.parse(e.target.result);
          setParsedData(data);
          if (data.name) {
            importForm.setValue('importedProjectName', data.name);
          }
        } catch {
          setParsedData(null);
        }
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

  const removePreviousDuplicatedData = async () => {
    setRemovePreviousDuplicatedDataInProgress(true);

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

      toast.success(
        'Geïmporteerd project en geïmporteerde data is verwijderd.'
      );
    } catch (error) {
      toast.error(
        'Verwijderen niet gelukt. Neem contact op met de beheerders.'
      );
    } finally {
      setRemovePreviousDuplicatedDataInProgress(false);
      setErrors([]);
      setIsErrorsVisible(false);
      setDuplicatedData(null);
    }
  };

  async function onImport(values: z.infer<typeof importFormSchema>) {
    try {
      const data = JSON.parse(file);
      const payload = transformExportToImport(data, values.importedProjectName);

      setImportingInProgress(true);
      setDuplicatedData(null);
      setErrors([]);

      const response = await fetch('/api/openstad/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setImportingInProgress(false);

      if (!response.ok) {
        const responseJSON = await response.json();
        setErrors(
          responseJSON.errors || [
            {
              error: 'Er is een fout opgetreden bij het importeren',
              step: 'Importeer project',
            },
          ]
        );
        setDuplicatedData(responseJSON.duplicatedData || null);
        toast.error(
          'Er is een fout opgetreden bij het importeren van het project.'
        );
        return;
      }

      const newId = await response.json();
      toast.success(
        'Het project is geïmporteerd. Je wordt nu doorgestuurd naar het project.',
        { duration: 5000 }
      );

      setTimeout(() => {
        if (newId) {
          router.push(`/projects/${newId}/widgets`);
        }
      }, 4000);
    } catch (e) {
      setImportingInProgress(false);
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
          <Form {...importForm} className="p-6 bg-white rounded-md mt-4">
            <Heading size="xl" className="mb-4">
              Importeer project
            </Heading>
            <Separator className="mb-4" />
            <form
              onSubmit={importForm.handleSubmit(onImport)}
              className="lg:w-2/3 grid grid-cols-1 gap-x-4 gap-y-8">
              <p>
                Upload een geëxporteerd JSON-bestand om een project te
                importeren met alle bijbehorende data (widgets, plannen, tags,
                statussen).
              </p>
              <Input type="file" accept=".json" onChange={handleChange} />
              {parsedData && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="font-semibold mb-2">
                    Inhoud van het exportbestand:
                  </p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>
                      Project: <strong>{parsedData.name}</strong>
                    </li>
                    <li>Plannen: {parsedData.resources?.length ?? 0}</li>
                    <li>Tags: {parsedData.tags?.length ?? 0}</li>
                    <li>Statussen: {parsedData.statuses?.length ?? 0}</li>
                    <li>Widgets: {parsedData.widgets?.length ?? 0}</li>
                  </ul>
                </div>
              )}
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
              <Button
                variant="default"
                type="submit"
                className="w-fit"
                disabled={importingInProgress || !file}>
                {importingInProgress ? 'Bezig met importeren...' : 'Importeren'}
              </Button>
            </form>
            {errors.length > 0 && (
              <div className="mt-4">
                <br />
                <Separator className="my-4" />
                <Heading size="lg">
                  Er is een fout opgetreden bij het importeren van het project.
                </Heading>
                <div className="mt-4">
                  <p>
                    De data is al (deels) geïmporteerd. Als je de data wilt
                    verwijderen, klik dan op de knop hieronder.
                  </p>

                  <div className="flex mt-4">
                    {duplicatedData && (
                      <Button
                        variant={'default'}
                        disabled={removePreviousDuplicatedDataInProgress}
                        onClick={() => removePreviousDuplicatedData()}
                        style={{ marginRight: '15px' }}>
                        {removePreviousDuplicatedDataInProgress
                          ? 'Bezig met verwijderen'
                          : 'Verwijder geïmporteerd project'}
                      </Button>
                    )}
                    <Button
                      style={{ backgroundColor: 'red', color: 'white' }}
                      onClick={() => setIsErrorsVisible(!isErrorsVisible)}>
                      {isErrorsVisible ? 'Verberg fouten' : 'Toon fouten'}
                    </Button>
                  </div>
                  {isErrorsVisible && (
                    <div className="mt-2 text-red-600">
                      <p style={{ color: 'black', marginBottom: '10px' }}>
                        Er zijn fouten opgetreden. Als de fouten niet duidelijk
                        zijn, neem dan contact op met de beheerders.
                      </p>
                      <ul>
                        {errors.map((error, index) => (
                          <li
                            key={index}>{`${error.step} - ${error.error}`}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            <br />
          </Form>
        </div>
      </PageLayout>
    </div>
  );
}
