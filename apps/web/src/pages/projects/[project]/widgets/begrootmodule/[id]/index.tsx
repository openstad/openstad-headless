import React from "react";
import { PageLayout } from "../../../../../../components/ui/page-layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../../components/ui/tabs";
import BegrootmoduleVoting from "./voting";
import BegrootmoduleDisplay from "./display";
import BegrootmoduleSorting from "./sorting";
import BegrootmoduleExplanation from "./explanation";
import BegrootmoduleAuthentication from "./authentication";
import BegrootmoduleLabels from "./label";
import { useRouter } from "next/router";

export default function WidgetBegrootmodule() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  return (
    <div>
      <PageLayout
        pageHeader="Project naam"
        breadcrumbs={[
          {
            name: "Projecten",
            url: "/projects",
          }, {
            name: "Widgets",
            url: `/projects/${projectId}/widgets`
          }, {
              name: "Begrootmodule",
              url: `/projects/${projectId}/widgets/begrootmodule/${id}`
          }
        ]}
      >
        <div>
          <Tabs defaultValue="voting">
            <TabsList className="w-full">
              <TabsTrigger value="voting">Stem opties</TabsTrigger>
              <TabsTrigger value="display">Display opties</TabsTrigger>
              <TabsTrigger value="sorting">Sorteer opties</TabsTrigger>
              <TabsTrigger value="explanation">Uitleg</TabsTrigger>
              <TabsTrigger value="authentication">Authenticatie</TabsTrigger>
              <TabsTrigger value="labels">Labels</TabsTrigger>
            </TabsList>
            <TabsContent value="voting" className="w-1/2">
              <BegrootmoduleVoting/>
            </TabsContent>
            <TabsContent value="display" className="w-1/2">
              <BegrootmoduleDisplay/>
            </TabsContent>
            <TabsContent value="sorting" className="w-1/2">
              <BegrootmoduleSorting/>
            </TabsContent>
            <TabsContent value="explanation" className="w-1/2">
              <BegrootmoduleExplanation/>
            </TabsContent>
            <TabsContent value="authentication" className="w-1/2">
              <BegrootmoduleAuthentication/>
            </TabsContent>
            <TabsContent value="labels" className="w-1/2">
              <BegrootmoduleLabels/>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
