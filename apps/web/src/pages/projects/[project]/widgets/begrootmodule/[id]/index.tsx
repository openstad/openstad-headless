import React from "react";
import { Button } from "../../../../../../components/ui/button";
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
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/router";
import useSWR from "swr";

export default function WidgetBegrootmodule() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  const { data: widget, isLoading: isLoadingWidget } = useSWR(
      projectId && id
      ? `/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`
      : null
  );

  // Todo Can this be hoisted above widgets so it can be shared? Now it must be placed in every index of a widget
  async function updateConfig(url:string, config:any) {
    await fetch(url, {
      method: 'PUT',
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify({config: config.arg})
    })
}


const { trigger } = useSWRMutation(`/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`, updateConfig, {
    onSuccess(data, key, config) {
        console.log({success: data});
    },
    onError(err, key, config) {
        console.log({err});
    },
});

const onSubmitHandler = (config: any) =>  {
  trigger(config);
}

if(isLoadingWidget || !widget) {
  return null;
}

  return (
    <div>
      <PageLayout
        pageHeader="Project naam"
        breadcrumbs={[
          {
            name: "Projecten",
            url: "/projects",
          },
          {
            name: "Widgets",
            url: "/projects/1/widgets",
          },
          {
            name: "Begrootmodule",
            url: "/projects/1/widgets/begrootmodule",
          },
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
              <BegrootmoduleVoting 
                config={widget.config} 
                handleSubmit={onSubmitHandler} />
            </TabsContent>
            <TabsContent value="display" className="w-1/2">
              <BegrootmoduleDisplay 
                config={widget.config} 
                handleSubmit={onSubmitHandler} />
            </TabsContent>
            <TabsContent value="sorting" className="w-1/2">
              <BegrootmoduleSorting 
                config={widget.config} 
                handleSubmit={onSubmitHandler} />
            </TabsContent>
            <TabsContent value="explanation" className="w-1/2">
              <BegrootmoduleExplanation  
                config={widget.config} 
                handleSubmit={onSubmitHandler} />
            </TabsContent>
            <TabsContent value="authentication" className="w-1/2">
              <BegrootmoduleAuthentication  
                config={widget.config} handleSubmit={onSubmitHandler}/>
            </TabsContent>
            <TabsContent value="labels" className="w-1/2">
              <BegrootmoduleLabels  
              config={widget.config} handleSubmit={onSubmitHandler}/>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
