import React from 'react';
import { PageLayout } from '../../../../../components/ui/page-layout';
import { useRouter } from 'next/router';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../components/ui/tabs';
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
        pageHeader="Project naam"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Image Resource',
            url: `/projects/${projectId}/image-resources`,
          },
          {
            name: 'Image Resource aanpassen',
            url: `/projects/${projectId}/image-resources/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="info">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="votes">Stemmen</TabsTrigger>
              <TabsTrigger value="comments">Argumenten</TabsTrigger>
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
