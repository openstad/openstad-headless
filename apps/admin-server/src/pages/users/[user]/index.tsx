import * as React from 'react';
import { PageLayout } from '../../../components/ui/page-layout';
import { useRouter } from 'next/router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateUserGeneral from './general';
import CreateUserProjects from './projects';
import CreateSecurity from './security';

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
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Algemene instellingen</TabsTrigger>
              <TabsTrigger value="projects">Projectsrechten</TabsTrigger>
              <TabsTrigger value="security">Beveiliging</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              <CreateUserGeneral />
            </TabsContent>
            <TabsContent value="projects" className="p-0">
              <CreateUserProjects />
            </TabsContent>
            <TabsContent value="security" className="p-0">
              <CreateSecurity />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
