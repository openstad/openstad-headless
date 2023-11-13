import React from 'react';
import { PageLayout } from '../../../components/ui/page-layout';

import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

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
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <Heading size="xl">Exporteren</Heading>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 w-fit">
              <div className="col-span-full">
                <div>
                  De volgende gegevens worden altijd geëxporteerd.
                  <ul className="list-disc">
                    <li className="ml-4">Oauth gegevens</li>
                  </ul>
                </div>
                <div className="mt-4">
                  Selecteer extra elementen die je zou willen toevoegen aan de
                  geëxporteerde waarden.
                </div>
              </div>
              <div className="col-span-full flex flex-row">
                <Checkbox id="CMS" />
                <Label htmlFor="CMS" className="my-auto ml-2">
                  CMS toevoegingen
                </Label>
              </div>
              <Button className="w-fit col-span-full mt-4" type="submit">
                Opslaan
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
