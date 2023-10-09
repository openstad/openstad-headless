import React from 'react'
import { PageLayout } from "../../../../../../components/ui/page-layout"
import { useRouter } from 'next/router'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import ChoicesSelectorForm from './form'


export default function WidgetKeuzewijzer() {
    const router = useRouter();
    const id = router.query.id;
    const projectId = router.query.project;

    const { data: widget, isLoading: isLoadingWidget } = useSWR(
        projectId && id
        ? `/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`
        : null
    );
        console.log({widget: widget?.config})
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

    if(isLoadingWidget || !widget?.config) {
        return null;
    }else {
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
                        url: "/projects/1/widgets"
                    },
                    {
                        name: "Keuzewijzer",
                        url: "/projects/1/widgets/keuzewijzer"
                    }
                ]}>
                    <div>
                        <div className='p-4 w-1/2'>
                            <ChoicesSelectorForm config={widget?.config} handleSubmit={onSubmitHandler}/>
                        </div>
                    </div>
                </PageLayout>
            </div>
        )
    }
    
  
}