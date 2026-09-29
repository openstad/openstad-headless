import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { Heading, ListHeading, Paragraph } from '@/components/ui/typography';
import useTemplates, { ProjectTemplate } from '@/hooks/use-template';
import { Download, Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function Templates() {
  const { data, createTemplate, renameTemplate, removeTemplate } =
    useTemplates();

  const [renameTarget, setRenameTarget] = useState<ProjectTemplate | null>(
    null
  );
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);

  const [importName, setImportName] = useState('');
  const [importFile, setImportFile] = useState('');
  const [importSaving, setImportSaving] = useState(false);

  function exportTemplate(template: ProjectTemplate) {
    const blob = new Blob(
      [JSON.stringify({ name: template.name, data: template.data }, null, 2)],
      { type: 'application/json' }
    );
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async function onRename() {
    if (!renameTarget || !renameValue.trim()) return;
    setRenameSaving(true);
    try {
      await renameTemplate(renameTarget.id, renameValue.trim());
      toast.success('Template hernoemd.');
      setRenameTarget(null);
    } catch (error) {
      toast.error('Hernoemen is niet gelukt.');
    } finally {
      setRenameSaving(false);
    }
  }

  async function onRemove(template: ProjectTemplate) {
    if (
      !window.confirm(
        `Weet je zeker dat je de template "${template.name}" wilt verwijderen?`
      )
    )
      return;
    try {
      await removeTemplate(template.id);
      toast.success('Template verwijderd.');
    } catch (error) {
      toast.error('Verwijderen is niet gelukt.');
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = (event) => {
      if (typeof event?.target?.result === 'string') {
        setImportFile(event.target.result);
      }
    };
  }

  async function onImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importName.trim() || !importFile) {
      toast.error('Vul een naam in en kies een bestand.');
      return;
    }
    setImportSaving(true);
    try {
      const parsed = JSON.parse(importFile);
      // Accept an exported template ({ name, data }) or a bare payload object.
      const templateData =
        parsed && typeof parsed.data === 'object' ? parsed.data : parsed;
      if (!templateData || typeof templateData !== 'object') {
        throw new Error('invalid');
      }
      await createTemplate(importName.trim(), templateData);
      toast.success('Template geïmporteerd.');
      setImportName('');
      setImportFile('');
    } catch (error) {
      toast.error('De file die geüpload is bevat onjuiste data.');
    } finally {
      setImportSaving(false);
    }
  }

  return (
    <div>
      <PageLayout
        pageHeader="Templates"
        breadcrumbs={[
          {
            name: 'Templates',
            url: '/templates',
          },
        ]}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <Heading size="xl">Templates</Heading>
            <Paragraph className="mt-2">
              Templates zijn losstaande kopieën van projecten. Bij het aanmaken
              van een nieuw project kun je een template kiezen; wijzigingen aan
              een template hebben geen invloed op eerder aangemaakte projecten.
            </Paragraph>
            <div className="grid grid-cols-2 lg:grid-cols-3 items-center py-2 px-2 mt-4 border-b border-border">
              <ListHeading>Naam</ListHeading>
              <ListHeading className="hidden lg:flex">Aangemaakt</ListHeading>
              <ListHeading className="flex justify-end">Acties</ListHeading>
            </div>
            <ul>
              {(data || []).map((template: ProjectTemplate) => (
                <li
                  key={template.id}
                  className="grid grid-cols-2 lg:grid-cols-3 items-center py-3 px-2 h-16 border-b border-border gap-2">
                  <Paragraph className="truncate">{template.name}</Paragraph>
                  <Paragraph className="hidden lg:flex truncate">
                    {template.createdAt
                      ? new Date(template.createdAt).toLocaleDateString('nl-NL')
                      : ''}
                  </Paragraph>
                  <Paragraph className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      title="Hernoemen"
                      aria-label={`Hernoem template ${template.name}`}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-gray-100"
                      onClick={() => {
                        setRenameValue(template.name);
                        setRenameTarget(template);
                      }}>
                      <Pencil strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      title="Exporteren"
                      aria-label={`Exporteer template ${template.name}`}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-gray-100"
                      onClick={() => exportTemplate(template)}>
                      <Download strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      title="Verwijderen"
                      aria-label={`Verwijder template ${template.name}`}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-gray-100"
                      onClick={() => onRemove(template)}>
                      <Trash2 strokeWidth={1.5} className="w-5 h-5" />
                    </button>
                  </Paragraph>
                </li>
              ))}
            </ul>
            {data && data.length === 0 && (
              <Paragraph className="py-4 px-2">
                Er zijn nog geen templates. Sla een project op als template via
                het projectenoverzicht, of importeer een template hieronder.
              </Paragraph>
            )}
          </div>

          <div className="p-6 bg-white rounded-md mt-4">
            <Heading size="xl" className="mb-4">
              Importeer template
            </Heading>
            <form
              onSubmit={onImport}
              className="lg:w-2/3 grid grid-cols-1 gap-x-4 gap-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="import-template-name"
                  className="text-sm font-medium">
                  Templatenaam
                </label>
                <Input
                  id="import-template-name"
                  placeholder="Naam"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                />
              </div>
              <Input
                type="file"
                accept="application/json,.json"
                aria-label="Templatebestand (JSON)"
                onChange={handleFileChange}
              />
              <Button
                variant="default"
                type="submit"
                className="w-fit"
                disabled={importSaving}>
                {importSaving ? 'Bezig met importeren' : 'Importeren'}
              </Button>
            </form>
          </div>
        </div>

        <Dialog
          open={!!renameTarget}
          onOpenChange={(open) => {
            if (!open) setRenameTarget(null);
          }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Template hernoemen</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <label
                htmlFor="rename-template-name"
                className="text-sm font-medium">
                Templatenaam
              </label>
              <Input
                id="rename-template-name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Naam"
              />
            </div>
            <Button
              onClick={() => onRename()}
              disabled={renameSaving || !renameValue.trim()}>
              {renameSaving ? 'Bezig met opslaan' : 'Opslaan'}
            </Button>
          </DialogContent>
        </Dialog>
      </PageLayout>
    </div>
  );
}
