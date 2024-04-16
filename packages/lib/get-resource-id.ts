function getResourceId({
  resourceId,
  url,
  targetUrl
}: {
  resourceId?: number;
  url: string;
  targetUrl?: string;
}): number|undefined {

  if (resourceId) return resourceId;

  if (!targetUrl) targetUrl = '?openstadResourceId=[id]';

  let regex = targetUrl.replace(/([.^$*+?()[\]{\|/])/g, "\\$1");
  regex = regex.replace(/\\\[id\\\]/, "(\\d+)");

  let match = url.match(regex);
  if (match) resourceId = parseInt( match[1] );

  return resourceId;

}

export {
  getResourceId as default,
  getResourceId,
}


