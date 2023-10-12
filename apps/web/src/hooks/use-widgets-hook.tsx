import useSWR from "swr";

  export function useWidgetsHook (projectId?: string) {
    let url = `/api/openstad/api/project/${projectId}/widgets?includeType=1`;

    const widgetsSwr = useSWR(
        projectId ? url : null
    );
    
    async function createWidget(typeId:string, description: string) {
        const res = await fetch(url, {
            method: 'POST',
            headers:{
            "Content-Type": "application/json"
            },
            body: JSON.stringify({type:typeId, description})
        })
        const data = await res.json();
        widgetsSwr.mutate();
    }


    return {...widgetsSwr, createWidget};
  }


