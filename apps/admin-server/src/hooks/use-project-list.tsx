import useSWR from 'swr';

type paramsType = {
  projectsWithIssues?: boolean,
}


export default function useProjectList(params?: paramsType) {

  let projectListSwrKey =`/api/openstad/api/project?includeConfig=1`;

  if (params?.projectsWithIssues)  {
    projectListSwrKey = `/api/openstad/api/project/issues`;
  }

  let projectListSwr = useSWR(projectListSwrKey);
  return { ...projectListSwr };

}
