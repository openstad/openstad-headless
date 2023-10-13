import useSWR from "swr";

  export default function useProject (projectId?: string) {
    const projectSwr = useSWR(
        projectId ? `/api/openstad/api/project/${projectId}?includeConfig=1` : null
    );


    return {...projectSwr};
  }
