import React from 'react';
import { PageLayout } from '../../../components/ui/page-layout';

import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';

export default function ProjectExport() {
  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Exporteren',
            url: '/projects/export',
          },
        ]}>
        <div className='p-6 bg-white rounded-md container m-6'>
          <p>De volgende gegevens worden altijd geëxporteerd.</p>
          <p>- Oauth gegevens</p>
          <br />
          <p>
            Selecteer extra elementen die je zou willen toevoegen aan de
            geëxporteerde waarden.
          </p>
          <br />
          <div className="items-top flex space-x-2">
            <Checkbox id="CMS" />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="CMS" className="text-sm font-medium leading-none">
                CMS toevoegingen
              </label>
            </div>
          </div>
          <br />
          <div className="py-4 bg-background border-t border-border flex flex-col">
            <Button className="self-end" type="submit">
              Exporteer
            </Button>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
