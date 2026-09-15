type Breadcrumb = {
  name: string;
  url: string;
};

export function widgetBreadcrumbs(
  projectId: string | string[] | undefined,
  widgetTypeName: string,
  widgetUrl: string,
  widgetName?: string
): Breadcrumb[] {
  return [
    { name: 'Projecten', url: '/projects' },
    { name: 'Widgets', url: `/projects/${projectId}/widgets` },
    {
      name: widgetName ? `${widgetTypeName} - ${widgetName}` : widgetTypeName,
      url: widgetUrl,
    },
  ];
}
