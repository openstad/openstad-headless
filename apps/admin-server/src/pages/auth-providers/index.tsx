import { useEffect, useState } from 'react';
import useAuthProvidersList, { useAuthProvidersEnabledCheck } from '@/hooks/use-auth-providers';
import { useRouter } from 'next/router';
import { PageLayout } from '@/components/ui/page-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { sortTable, searchTable } from '@/components/ui/sortTable';

function AuthProvidersLayout({ children }) {
  return (
    <div>
      <PageLayout
        pageHeader="Authenticatie providers"
        breadcrumbs={[
          {
            name: 'Authenticatie providers',
            url: '/auth-providers',
          },
        ]}
        action={
          <Link href="/auth-providers/create">
            <Button variant="default" className="flex w-fit">
              <Plus size="20" className="hidden lg:flex" />
              Provider toevoegen
            </Button>
          </Link>
        }>
        <div className="container py-6">
          {children}
        </div>
      </PageLayout>
    </div>
  );
}

export default function AuthProviders() {

  const authProvidersEnabled = useAuthProvidersEnabledCheck();
  const router = useRouter();

  const { data, isLoading, error } = useAuthProvidersList();

  const [filterData, setFilterData] = useState(data);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);

  useEffect(() => {
    setFilterData(data);
  }, [data]);

  useEffect(() => {
    if (authProvidersEnabled === false) {
      // Redirect to another page or show a message
      console.error('Auth providers are not enabled according to the server -- Redirecting back');
      router.back();
    }
  }, [authProvidersEnabled]);

  if (authProvidersEnabled === null) {
    return <div>Loading auth adapter status...</div>;
  }

  if (!data) {
    return (
      <AuthProvidersLayout>
        <div className="p-6 bg-white rounded-md clear-right">
          <Paragraph className={'mb-2'}>Er zijn nog geen auth providers toegevoegd</Paragraph>


          <Link href="/auth-providers/create">
            <Button variant="default" className="flex w-fit">
              <Plus size="20" className="hidden lg:flex" />
              Provider toevoegen
            </Button>
          </Link>
        </div>
      </AuthProvidersLayout>
    );
  }

  return (

    <AuthProvidersLayout>

      <div className="float-right mb-4 flex gap-4">
        <p className="text-xs font-medium text-muted-foreground self-center">Filter op:</p>
        <select
          className="p-2 rounded"
          onChange={(e) => setFilterSearchType(e.target.value)}
        >
          <option value="">Alles</option>
          <option value="name">Projectnaam</option>
          <option value="issues">Issues</option>
          <option value="config.votes.isActive">Stemmen</option>
          <option value="config.comments.canComment">Gestemd op nee</option>
          <option value="config.project.endDate">Eind datum</option>
        </select>
        <input
          type="text"
          className="p-2 rounded"
          placeholder="Zoeken..."
          onChange={(e) => debouncedSearchTable(e.target.value, filterData, data)}
        />
      </div>

      <div className="p-6 bg-white rounded-md clear-right">
        <div className="grid grid-cols-2 lg:grid-cols-8 items-center py-2 px-2 border-b border-border">
          <ListHeading className="hidden lg:flex">
            <button className="filter-button" onClick={(e) => setFilterData(sortTable('id', e, filterData))}>
              ID
            </button>
          </ListHeading>
          <ListHeading className="hidden lg:flex">
            <button className="filter-button" onClick={(e) => setFilterData(sortTable('name', e, filterData))}>
              Provider naam
            </button>
          </ListHeading>
          <ListHeading className="hidden lg:flex">
            <button className="filter-button" onClick={(e) => setFilterData(sortTable('type', e, filterData))}>
              Type
            </button>
          </ListHeading>
          <ListHeading className="hidden lg:flex">
            <button className="filter-button" onClick={(e) => setFilterData(sortTable('createdAt', e, filterData))}>
              Aangemaakt op
            </button>
          </ListHeading>
        </div>
        <ul>
          {filterData && filterData?.map((authProvider: any) => {
            return (
              <li
                className="grid grid-cols-2 lg:grid-cols-8 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2"
                key={authProvider.id}
                onClick={(d) => {
                  router.push(`${router.asPath}/${authProvider.id}`);
                }}>
                <Paragraph className="truncate">{authProvider.id}</Paragraph>
                <Paragraph className="truncate">{authProvider.name}</Paragraph>
                <Paragraph className="hidden lg:flex truncate">
                  {authProvider.type}
                </Paragraph>
                <Paragraph className="hidden lg:flex truncate">
                  {new Date(authProvider.createdAt).toLocaleDateString('nl-NL')}
                </Paragraph>
                <Paragraph className="flex">
                  <ChevronRight
                    strokeWidth={1.5}
                    className="w-5 h-5 my-auto ml-auto"
                  />
                </Paragraph>
              </li>
            );
          })}
        </ul>
      </div>
    </AuthProvidersLayout>
  );


}
