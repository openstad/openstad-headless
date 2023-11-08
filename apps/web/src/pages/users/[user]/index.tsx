import * as React from 'react';
import { PageLayout } from '../../../components/ui/page-layout';
import { useRouter } from 'next/router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateUserGeneral from './general';
import CreateUserProjects from './projects';

export default function CreateUser() {
  const router = useRouter();
  const userId = router.query.userId;

  return (
    <div>
      <PageLayout
        pageHeader="Gebruikers"
        breadcrumbs={[
          {
            name: 'Gebruikers',
            url: '/users',
          },
          {
            name: 'Gebruiker aanpassen',
            url: `/users/${userId}`,
          },
        ]}>
        <div>
          <Tabs defaultValue="general">
            <TabsList className="w-full">
              <TabsTrigger value="general">Algemene instellingen</TabsTrigger>
              <TabsTrigger value="projects">Projectsrechten</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="w-1/2">
              <CreateUserGeneral />
            </TabsContent>
            <TabsContent value="projects" className="w-1/2">
              <CreateUserProjects />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
