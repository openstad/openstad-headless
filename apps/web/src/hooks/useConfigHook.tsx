import { useRouter } from "next/router";
import { ComponentType } from "react";
import useSWR, { mutate } from "swr";

const getDisplayName = (Component: ComponentType) =>
  Component.displayName || Component.name || 'Component';

const WithWidgetConfig = (
    Component: ComponentType,
  ) =>
    Object.assign(
      ({ ...props }) => {
        const router = useRouter();
        const id = router.query.id;
        const projectId = router.query.project;
    
        const { data: widget, isLoading: isLoadingWidget } = useSWR(
            projectId && id
            ? `/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`
            : null
        );

        if(!isLoadingWidget && widget) {
            return <Component config={widget.config} {...props} />;
        }
        return null;
  
      },
      { displayName: `withAuth(${getDisplayName(Component)})` }
    );
  export { WithWidgetConfig };



  export function useConfig () {
    const router = useRouter();
    const id = router.query.id;
    const projectId = router.query.project;

    const swr = useSWR(
        projectId && id
        ? `/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`
        : null
    )

    async function updateConfig(config:any) {
        console.log({config});
        const res = await fetch(`/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`, {
          method: 'PUT',
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify({config})
        })
        const data = await res.json();

        swr.mutate(data);
    }

    return {...swr, updateConfig};
  }