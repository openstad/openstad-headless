import { ConfirmActionDialog } from '@/components/dialog-confirm-action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading, Paragraph } from '@/components/ui/typography';
import usePluginCapabilities from '@/hooks/use-plugin-capabilities';
import useResourceLinks from '@/hooks/use-resource-links';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const MIN_SEARCH_LENGTH = 2;

export default function ProjectResourceLinks() {
  const router = useRouter();
  const { project, id } = router.query;
  const {
    data: links,
    createLink,
    removeLink,
    searchResources,
  } = useResourceLinks(project as string, id as string);
  const { capabilities } = usePluginCapabilities();

  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Array<{ id: string; label: string }>>(
    []
  );
  const [searched, setSearched] = useState(false);
  const [externalSource, setExternalSource] = useState('');
  const [externalId, setExternalId] = useState('');

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (search.trim().length < MIN_SEARCH_LENGTH) {
      toast.error(`Typ minimaal ${MIN_SEARCH_LENGTH} tekens`);
      return;
    }
    try {
      const found = await searchResources(search.trim());
      setResults(found.filter((item) => item.id !== String(id)));
      setSearched(true);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleLink(targetSource: string, targetId: string) {
    try {
      await createLink(targetSource, targetId);
      toast.success('Koppeling toegevoegd');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleRemove(linkId: number) {
    try {
      await removeLink(linkId);
      toast.success('Koppeling verwijderd');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="p-6 bg-white rounded-md grid grid-cols-1 gap-6">
      <div>
        <Heading size="xl">Koppelingen</Heading>
        <Paragraph className="mt-2">
          Koppelingen die je hier maakt of verwijdert, gelden direct. Er worden
          geen verzoeken of e-mails verstuurd.
        </Paragraph>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th scope="col" className="py-2">
              Gekoppeld aan
            </th>
            <th scope="col" className="py-2">
              Bron
            </th>
            <th scope="col" className="py-2">
              Richting
            </th>
            <th scope="col" className="py-2">
              <span className="sr-only">Acties</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {(links || []).length === 0 ? (
            <tr>
              <td colSpan={4} className="py-3">
                Deze inzending heeft nog geen koppelingen.
              </td>
            </tr>
          ) : (
            (links || []).map((link) => (
              <tr key={link.id} className="border-b">
                <td className="py-2">
                  {link.resource
                    ? `${link.resource.title} (${link.resource.id})`
                    : link.targetId}
                </td>
                <td className="py-2">{link.source}</td>
                <td className="py-2">
                  {link.direction === 'outgoing'
                    ? 'Van deze inzending'
                    : 'Naar deze inzending'}
                </td>
                <td className="py-2 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => e.preventDefault()}>
                    <ConfirmActionDialog
                      buttonText="Koppeling verwijderen"
                      header="Koppeling verwijderen"
                      message="Weet je zeker dat je deze koppeling wilt verwijderen? Er wordt geen e-mail verstuurd."
                      confirmButtonText="Verwijderen"
                      cancelButtonText="Annuleren"
                      confirmButtonVariant="destructive"
                      onConfirmAccepted={() => handleRemove(link.id)}
                    />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <form onSubmit={handleSearch} className="grid grid-cols-1 gap-2 lg:w-2/3">
        <label htmlFor="link-search" className="font-medium">
          Inzending zoeken om te koppelen
        </label>
        <div className="flex gap-2">
          <Input
            id="link-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Titel van de inzending"
          />
          <Button type="submit">Zoeken</Button>
        </div>
      </form>

      {searched ? (
        results.length === 0 ? (
          <Paragraph>Geen inzendingen gevonden.</Paragraph>
        ) : (
          <ul className="grid grid-cols-1 gap-2 lg:w-2/3">
            {results.map((result) => (
              <li
                key={result.id}
                className="flex justify-between items-center border rounded-md p-2">
                <span>
                  {result.label} ({result.id})
                </span>
                <Button
                  type="button"
                  onClick={() => handleLink('openstad', result.id)}>
                  Koppelen
                </Button>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {capabilities.sources.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 lg:w-2/3">
          <span className="font-medium">Extern item koppelen</span>
          <div className="flex gap-2">
            <Select value={externalSource} onValueChange={setExternalSource}>
              <SelectTrigger aria-label="Externe bron">
                <SelectValue placeholder="Kies een bron" />
              </SelectTrigger>
              <SelectContent>
                {capabilities.sources.map((source) => (
                  <SelectItem key={source.key} value={source.key}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              aria-label="Id van het externe item"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              placeholder="Id"
            />
            <Button
              type="button"
              disabled={!externalSource || !externalId.trim()}
              onClick={() => handleLink(externalSource, externalId.trim())}>
              Koppelen
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
