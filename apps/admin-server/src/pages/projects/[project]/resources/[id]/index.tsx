import React from 'react';
import { PageLayout } from '../../../../../../src/components/ui/page-layout';
import { useRouter } from 'next/router';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../src/components/ui/tabs';
import ProjectResourceCreate from "./info";
import ProjectResourceVotes from "./votes";
import ProjectResourceArguments from "./comments";

export default function ProjectResource() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  return (
    <div>
      <PageLayout
        pageHeader="Projectnaam"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Resources',
            url: `/projects/${projectId}/resources`,
          },
          {
            name: 'Resource aanpassen',
            url: `/projects/${projectId}/resources/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="info">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="votes">Stemmen</TabsTrigger>
              <TabsTrigger value="comments">Reacties</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="p-0">
              <ProjectResourceCreate />
            </TabsContent>
            <TabsContent value="votes" className="p-0">
              <ProjectResourceVotes />
            </TabsContent>
            <TabsContent value="comments" className="p-0">
              <ProjectResourceArguments />
            </TabsContent>
          </Tabs>

        </div>
      </PageLayout>
    </div>
  );
}
