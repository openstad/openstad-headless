import { ApiTokenStatusBadge } from '@/components/api-token-status-badge';
import { Button } from '@/components/ui/button';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { ApiToken, useProjectApiTokens } from '@/hooks/use-api-tokens';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import { PageLayout } from '../../../components/ui/page-layout';

function maskToken(token: ApiToken) {
  return `${token.tokenPrefix}...${token.lastFour}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL');
}

function formatExpiry(iso: string | null) {
  if (!iso) return 'Geen einddatum';
  return new Date(iso).toLocaleDateString('nl-NL');
}

export default function ProjectApiTokens() {
  const router = useRouter();
  const { project } = router.query;

  const {
    data: tokens,
    error,
    isLoading,
    revokeToken,
  } = useProjectApiTokens(project as string);

  async function handleRevoke(tokenId: number) {
    if (!confirm('Weet je zeker dat je dit token wilt intrekken?')) return;
    try {
      await revokeToken(tokenId);
      toast.success('Token ingetrokken');
    } catch {
      toast.error('Intrekken van token mislukt');
    }
  }

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'API-tokens',
            url: `/projects/${project}/api-tokens`,
          },
        ]}>
        <div className="container py-6">
          <div className="mb-2">
            <span className="text-sm text-muted-foreground">
              {`${tokens?.length ?? 0} ${tokens?.length === 1 ? 'token' : 'tokens'}`}
            </span>
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-2 lg:grid-cols-10 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex lg:col-span-2">
                Eigenaar
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-2">
                Naam
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-2">
                Token
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Aangemaakt
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Verloopt
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Status
              </ListHeading>
            </div>
            <ul className="admin-overview">
              {error && (
                <li className="py-3 px-2">
                  <Paragraph className="text-red-700">
                    Tokens konden niet worden geladen. Probeer het later
                    opnieuw.
                  </Paragraph>
                </li>
              )}
              {!error && isLoading && (
                <li className="py-3 px-2">
                  <Paragraph className="text-muted-foreground">
                    Tokens laden…
                  </Paragraph>
                </li>
              )}
              {!error && !isLoading && (!tokens || tokens.length === 0) && (
                <li className="py-3 px-2">
                  <Paragraph className="text-muted-foreground">
                    Geen tokens gevonden.
                  </Paragraph>
                </li>
              )}
              {tokens?.map((token) => (
                <li
                  key={token.id}
                  className={`grid grid-cols-2 lg:grid-cols-10 items-center py-3 px-2 border-b ${
                    token.status !== 'active' ? 'opacity-60' : ''
                  }`}>
                  <Paragraph className="truncate lg:col-span-2">
                    {token.owner?.name || `Gebruiker ${token.userId}`}
                    {token.isSuperUserToken && (
                      <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium border rounded-full bg-blue-100 text-blue-800 border-blue-300 whitespace-nowrap">
                        Superuser
                      </span>
                    )}
                  </Paragraph>
                  <Paragraph className="hidden lg:block truncate lg:col-span-2 pr-2">
                    {token.name || '—'}
                  </Paragraph>
                  <Paragraph className="hidden lg:block truncate lg:col-span-2 font-mono pr-2">
                    {maskToken(token)}
                  </Paragraph>
                  <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                    {formatDate(token.createdAt)}
                  </Paragraph>
                  <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                    {formatExpiry(token.expiresAt)}
                  </Paragraph>
                  <div className="lg:col-span-1">
                    <ApiTokenStatusBadge status={token.status} />
                  </div>
                  <div className="flex justify-end lg:col-span-1">
                    {token.status !== 'revoked' && !token.isSuperUserToken && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(token.id)}>
                        Intrekken
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
