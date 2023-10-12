import useSWR from "swr";

  export function useProject (projectId?: string) {
    const projectSwr = useSWR(
        projectId ? `/api/openstad/api/project/${projectId}` : null
    );


    return {...projectSwr};
  }

