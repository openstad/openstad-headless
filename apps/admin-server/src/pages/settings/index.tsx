import { GlobalBrandingForm } from '@/components/global-branding-form';
import { GlobalEmailForm } from '@/components/global-email-form';
import {
  WithWhitelistedEmailsProps,
  withWhitelistedEmails,
} from '@/lib/server-side-props-definition';
import React from 'react';

import { PageLayout } from '../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import ProjectTags from '../projects/[project]/tags';

export const getServerSideProps = withWhitelistedEmails;

export default function GlobalSettings({
  whitelistedEmails,
}: WithWhitelistedEmailsProps) {
  return (
    <div>
      <PageLayout
        pageHeader="Algemene instellingen"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Instellingen',
            url: `/projects/settings`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="display">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="display">Tags</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="email">E-mail instellingen</TabsTrigger>
            </TabsList>
            <TabsContent value="display" className="p-0">
              <ProjectTags preset="global" />
            </TabsContent>
            <TabsContent value="branding" className="p-0">
              <GlobalBrandingForm />
            </TabsContent>
            <TabsContent value="email" className="p-0">
              <GlobalEmailForm whitelistedEmails={whitelistedEmails} />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
