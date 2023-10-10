import React from 'react'
import { PageLayout } from "../../../../../../components/ui/page-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../components/ui/tabs";
import ArgumentsGeneral from './general'
import ArgumentsList from './list'
import ArgumentsForm from './form'
import { useRouter } from 'next/router';
import useSWR from "swr";
import useSWRMutation from 'swr/mutation';


export default function WidgetArguments() {
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
                    url: `/projects/${projectId}/widgets`
                },
                {
                    name: "Arguments",
                    url: `/projects/${projectId}/widgets/arguments/${id}`
                }
            ]}
            >
                <div>
                    <Tabs defaultValue="general">
                        <TabsList className="w-full">
                            <TabsTrigger value="general">Algemeen</TabsTrigger>
                            <TabsTrigger value="list">Lijst</TabsTrigger>
                            <TabsTrigger value="form">Formulier</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general" className="w-1/2">
                            <ArgumentsGeneral config={widget.config} handleSubmit={onSubmitHandler} />
                        </TabsContent> 
                        <TabsContent value="list" className="w-1/2">
                            <ArgumentsList config={widget.config} handleSubmit={onSubmitHandler} />
                        </TabsContent> 
                        <TabsContent value="form" className="w-1/2">
                            <ArgumentsForm config={widget.config} handleSubmit={onSubmitHandler} />
                        </TabsContent> 
                    </Tabs>
                </div>
            </PageLayout>
        </div>
    )
}