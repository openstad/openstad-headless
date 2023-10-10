import React from 'react'
import { PageLayout } from "../../../../../../components/ui/page-layout"
import { Button } from '../../../../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";
import WidgetIdeasMapMaps from './maps';
import WidgetIdeasMapButton from './button';
import WidgetIdeasMapCounter from './counter';
import WidgetIdeasMapContent from './content';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

export default function WidgetIdeasMap() {
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
        location.reload();
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

    return(
        <div>
            <PageLayout
            pageHeader='Project naam'
            breadcrumbs={[
                {
                    name: "Projecten",
                    url: "/projects"
                },
                {
                    name: "Widgets",
                    url: `projects/${projectId}/widgets`
                },
                {
                    name: "Ideeën Map",
                    url: `/projects/${projectId}/widgets/ideasmap/${id}`
                }
            ]}
            >
                <div>
                    <Tabs defaultValue="map">
                        <TabsList className="w-full">
                            <TabsTrigger value="map">Map</TabsTrigger>
                            <TabsTrigger value="button">Call-To-Action knop</TabsTrigger>
                            <TabsTrigger value="counter">Teller</TabsTrigger>
                            <TabsTrigger value="content">Content</TabsTrigger>
                        </TabsList>
                        <TabsContent value="map" className="w-1/2">
                            <WidgetIdeasMapMaps 
                            config={widget.config} 
                            handleSubmit={onSubmitHandler} />
                        </TabsContent>
                        <TabsContent value="button" className="w-1/2">
                            <WidgetIdeasMapButton 
                            config={widget.config}
                            handleSubmit={onSubmitHandler} />
                        </TabsContent>
                        <TabsContent value="counter" className="w-1/2">
                            <WidgetIdeasMapCounter 
                            config={widget.config}
                            handleSubmit={onSubmitHandler} />
                        </TabsContent>
                        <TabsContent value="content" className="w-1/2">
                            <WidgetIdeasMapContent 
                            config={widget.config} 
                            handleSubmit={onSubmitHandler}/>
                        </TabsContent>
                    </Tabs>
                </div>
            </PageLayout>
        </div>
    )
}