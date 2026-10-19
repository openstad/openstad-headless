import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Heading, Paragraph } from '@/components/ui/typography';
import { useProject } from '@/hooks/use-project';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import {
  VoteLinkRow,
  voteLinksToClipboardText,
  voteLinksToCsv,
} from '@/lib/vote-links';
import { zodResolver } from '@hookform/resolvers/zod';
import { canLikeResource } from '@openstad-headless/lib/can-like';
import { buildResourceVoteLink } from '@openstad-headless/lib/resource-vote-link';
import { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';
import React, { useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import * as z from 'zod';

const formSchema = z.object({
  enableResourceVoteLink: z.boolean().optional(),
});

type Formdata = z.infer<typeof formSchema>;

type Resource = {
  id: number;
  title?: string;
  publishDate?: string | null;
  statuses?: Array<{ extraFunctionality?: { canLike?: boolean } }>;
};

const UTF8_BOM = '\uFEFF';

const idList = (value?: string) =>
  (value || '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => /^\d+$/.test(id));

export default function BegrootmoduleVoteLinks(
  props: StemBegrootWidgetProps & EditFieldProps<StemBegrootWidgetProps>
) {
  const form = useForm<Formdata>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      enableResourceVoteLink: props.enableResourceVoteLink || false,
    },
  });

  function onSubmit(values: Formdata) {
    props.updateConfig({ ...props, ...values });
  }

  const { data: project } = useProject();
  const voteType = project?.config?.votes?.voteType || '';
  const isPerTag = voteType === 'countPerTag' || voteType === 'budgetingPerTag';

  const tagIds = idList(props.onlyIncludeTagIds);
  const statusIds = idList(props.onlyIncludeStatusIds);
  const params = new URLSearchParams({
    noPagination: 'true',
    includeTags: '1',
  });
  tagIds.forEach((id) => params.append('tags', id));
  statusIds.forEach((id) => params.append('statuses', id));
  const projectId = Number(props.projectId);
  const { data, isLoading, error } = useSWR(
    projectId
      ? `/api/openstad/api/project/${projectId}/resource?${params.toString()}`
      : null
  );

  const [votePageUrl, setVotePageUrl] = useState('');
  const inputId = useId();

  const resources: Resource[] = useMemo(() => {
    const records: Resource[] = Array.isArray(data)
      ? data
      : data?.records || [];
    return records
      .filter((resource) => !!resource.publishDate)
      .sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', 'nl', {
          sensitivity: 'base',
        })
      );
  }, [data]);

  const rows: VoteLinkRow[] = useMemo(
    () =>
      votePageUrl.trim()
        ? resources.map((resource) => ({
            id: resource.id,
            title: resource.title || '',
            link: buildResourceVoteLink(votePageUrl, resource.id),
            note: canLikeResource(resource)
              ? ''
              : 'Status staat stemmen niet toe',
          }))
        : [],
    [resources, votePageUrl]
  );

  const urlIsValid = rows.length === 0 || /^https?:\/\//.test(rows[0].link);
  const canExport = rows.length > 0 && urlIsValid;

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error('Kopiëren is niet gelukt');
    }
  };

  const downloadCsv = () => {
    const blob = new Blob([`${UTF8_BOM}${voteLinksToCsv(rows)}`], {
      type: 'text/csv;charset=utf-8',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stemlinks-project-${projectId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Stemlinks</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-2/3 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="enableResourceVoteLink"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Stemlinks per inzending gebruiken</FormLabel>
                <FormDescription>
                  Opent een bezoeker de stempagina met ?openstadResourceId=[id],
                  dan staat die inzending meteen in de selectie. Bovenaan de
                  widget verschijnt een melding hierover. De inzending
                  detailpagina kan zo&apos;n link tonen met de knop &apos;Ga
                  naar de stempagina&apos;.
                </FormDescription>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          {isPerTag && (
            <Alert variant="warning">
              <AlertDescription>
                Stemlinks werken niet bij stemmen per tag of per thema. Dit
                project gebruikt die manier van stemmen.
              </AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-fit col-span-full">
            Opslaan
          </Button>
        </form>
      </Form>

      <Separator className="my-6" />

      <div className="lg:w-2/3 grid grid-cols-1 gap-4">
        <Heading size="lg">Lijst met stemlinks</Heading>
        <Paragraph>
          Plak de link van de pagina waarop deze begrootmodule staat. Je krijgt
          dan per inzending een unieke stemlink, bijvoorbeeld om te delen met de
          indieners.
        </Paragraph>
        <div className="grid gap-2">
          <Label htmlFor={inputId}>Link naar de stempagina</Label>
          <Input
            id={inputId}
            type="url"
            inputMode="url"
            placeholder="https://www.gemeente.nl/stemmen"
            value={votePageUrl}
            onChange={(e) => setVotePageUrl(e.target.value)}
          />
        </div>

        {!form.watch('enableResourceVoteLink') && (
          <Alert variant="warning">
            <AlertDescription>
              Stemlinks staan nog uit voor deze widget. Zet ze hierboven aan en
              sla op, anders openen de links alleen de stempagina.
            </AlertDescription>
          </Alert>
        )}

        {!urlIsValid && (
          <Alert variant="error">
            <AlertDescription>
              Gebruik de volledige link, die begint met https://
            </AlertDescription>
          </Alert>
        )}
      </div>

      {error ? (
        <Alert variant="error" className="mt-4">
          <AlertDescription>
            De inzendingen konden niet worden opgehaald.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <Paragraph className="mt-4">Inzendingen ophalen…</Paragraph>
      ) : votePageUrl.trim() && urlIsValid ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Button
              type="button"
              disabled={!canExport}
              onClick={() =>
                copy(
                  voteLinksToClipboardText(rows),
                  `${rows.length} stemlinks gekopieerd naar klembord`
                )
              }>
              Kopieer alle links
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!canExport}
              onClick={downloadCsv}>
              Download als CSV
            </Button>
            <Paragraph className="text-muted-foreground">
              {rows.length === 1 ? '1 inzending' : `${rows.length} inzendingen`}
            </Paragraph>
          </div>

          {rows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Titel</TableHead>
                  <TableHead>Stemlink</TableHead>
                  <TableHead className="w-0">
                    <span className="sr-only">Kopiëren</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="align-top">
                      <span className="font-medium">{row.title}</span>
                      {row.note ? (
                        <span className="block text-xs text-yellow-800">
                          {row.note}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="align-top break-all">
                      {row.link}
                    </TableCell>
                    <TableCell className="align-top">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Kopieer stemlink van ${row.title}`}
                        onClick={() =>
                          copy(row.link, 'Stemlink gekopieerd naar klembord')
                        }>
                        Kopieer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Paragraph>
              Er zijn geen gepubliceerde inzendingen voor deze widget.
            </Paragraph>
          )}
        </div>
      ) : null}
    </div>
  );
}
