type DetailUrlProject = {
  id?: number | string;
  detailPageLink?: string;
  overviewUrl?: string;
};

type DetailUrlResource = {
  id?: number | string;
  projectId?: number | string;
};

type DetailUrlLocation = {
  pathname: string;
  protocol: string;
  host: string;
};

export function buildResourceDetailUrl(
  itemLink: string | undefined,
  resource: DetailUrlResource,
  selectedProjects: Array<DetailUrlProject> | undefined,
  location: DetailUrlLocation
): string {
  let urlToUse = itemLink;

  if (!!selectedProjects && selectedProjects.length > 0) {
    const project = selectedProjects.find(
      (selectedProject) => selectedProject.id === resource.projectId
    );

    if (resource?.id && project) {
      urlToUse = project.detailPageLink;
    } else if (!resource?.id && project?.overviewUrl) {
      urlToUse = project.overviewUrl;
    }
  }

  let newUrl = urlToUse?.replace('[id]', String(resource.id));
  if (!newUrl?.startsWith('http')) {
    if (!newUrl?.startsWith('/')) {
      newUrl = `${location.pathname}${
        location.pathname.endsWith('/') ? '' : '/'
      }${newUrl}`;
    }
    newUrl = `${location.protocol}//${location.host}${newUrl}`;
  }
  return newUrl;
}
