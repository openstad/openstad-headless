import useSWR from 'swr';

type paramsType = {
  projectsWithIssues?: boolean,
}


export default function useProjectList(params?: paramsType) {

  let projectListSwr = useSWR(`/api/openstad/api/project?includeConfig=1`);

  if (params?.projectsWithIssues)  {
    projectListSwr = useSWR(`/api/openstad/api/project/issues`);
  }

  if (!projectListSwr) {
    console.log('??');
    projectListSwr = useSWR(`/api/openstad/api/project?includeConfig=1`);
  }

  return { ...projectListSwr };

}
