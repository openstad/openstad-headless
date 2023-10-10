import React from 'react'
import { PageLayout } from "../../../../../../components/ui/page-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";
import WidgetMapGeneral from './general';
import WidgetMapMap from './map';
import WidgetMapContent from './content';
import WidgetMapSort from './sort';
import WidgetMapImage from './images';
import WidgetMapDetails from './details';
import WidgetMapFilter from './filter';
import WidgetMapReaction from './reaction';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

export default function WidgetMap() {
    const router = useRouter();
    const id = router.query.id;
    const projectId = router.query.project;

    const { data: widget, isLoading: isLoadingWidget } = useSWR(
        projectId && id
        ? `/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`
        : null
    );
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

    function onSubmit(values: z.infer<typeof formSchema>) {
        onSubmitHandler({like: values});
    }

    if(isLoadingWidget || !widget?.config) {
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
                    url: `/projects/${projectId}/widgets`
                },
                {
                    name: "Ideeën Map",
                    url: `/projects/${projectId}/widgets/map/${id}`
                }
            ]}
            >
                <div>
                    <Tabs defaultValue="general">
                        <TabsList className="w-full">
                            <TabsTrigger value="general">Algemeen</TabsTrigger>
                            <TabsTrigger value="map">Kaart</TabsTrigger>
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="sort">Sorteren</TabsTrigger>
                            <TabsTrigger value="images">Idee afbeeldingen</TabsTrigger>
                            <TabsTrigger value="details">Idee details</TabsTrigger>
                            <TabsTrigger value="filter">Filterbalk</TabsTrigger>
                            <TabsTrigger value="reaction">Reacties</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general" className="w-1/2">
                            <WidgetMapGeneral 
                                config={widget.config}        
                                handleSubmit={onSubmitHandler} />
                        </TabsContent>
                        <TabsContent value="map" className="w-1/2">
                            <WidgetMapMap  
                                config={widget.config}        
                                handleSubmit={onSubmitHandler} />
                        </TabsContent>
                        <TabsContent value="content" className="w-1/2">
                            <WidgetMapContent   
                                config={widget.config}        
                                handleSubmit={onSubmitHandler} />
                        </TabsContent>
                        <TabsContent value="sort" className="w-1/2">
                            <WidgetMapSort   
                                config={widget.config}        
                                handleSubmit={onSubmitHandler} />
                        </TabsContent>
                        <TabsContent value="images" className="w-1/2">
                            <WidgetMapImage 
                              config={widget.config}        
                              handleSubmit={onSubmitHandler} />
                        </TabsContent>
                        <TabsContent value="details" className="w-1/2">
                            <WidgetMapDetails  
                                config={widget.config}        
                                handleSubmit={onSubmitHandler} />
                        </TabsContent>
                        <TabsContent value="filter" className="w-1/2">
                            <WidgetMapFilter
                              config={widget.config}        
                              handleSubmit={onSubmitHandler} />
                        </TabsContent>
                        <TabsContent value="reaction" className="w-1/2">
                            <WidgetMapReaction   
                                config={widget.config}        
                                handleSubmit={onSubmitHandler} />
                        </TabsContent>
                    </Tabs>
                </div>
            </PageLayout>
        </div>
    )
}