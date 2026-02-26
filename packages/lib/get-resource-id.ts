function getResourceId({
  resourceId,
  url,
  targetUrl,
}: {
  resourceId?: number;
  url: string;
  targetUrl?: string;
}): number | undefined {
  // Methode 1: Resource ID is direct meegegeven
  if (resourceId) {
    return resourceId;
  }

  if (!targetUrl) targetUrl = '?openstadResourceId=[id]';

  // Methode 2: Resource ID ophalen via reguliere expressie uit de URL
  let regex = targetUrl.replace(/([\\^$.|?*+()[\]{}])/g, '\\$1');
  regex = regex.replace(/\\\[id\\\]/, '(\\d+)');

  let match = url.match(regex);

  if (match) {
    resourceId = parseInt(match[1]);
  }

  // Methode 3: Resource ID ophalen door pad en query parameters apart te verwerken
  if (!resourceId) {
    const urlPath = new URL(url).pathname + new URL(url).search;

    regex = targetUrl.replace(/([\\^$.|?*+()[\]{}])/g, '\\$1');
    regex = regex.replace(/\\\[id\\\]/, '(\\d+)');

    match = urlPath.match(regex);

    if (match) {
      resourceId = parseInt(match[1]);
    }

    // Methode 4: Resource ID ophalen via URLSearchParams (kijken naar query parameters)
    if (!resourceId) {
      const urlParams = new URLSearchParams(window.location.search);
      const paramValue = urlParams.get(targetUrl.replace(/[?&]\[id\]/, ''));

      resourceId = paramValue ? parseInt(paramValue, 10) : undefined;

      // Methode 5: Extra controle op [id] patroon in targetUrl en query parameter
      if (!resourceId && targetUrl.includes('[id]')) {
        const paramName = getFirstParamNameWithIdValue(targetUrl);

        let paramValue = undefined;

        if (paramName && urlParams.has(paramName)) {
          paramValue = urlParams.get(paramName);
        }

        resourceId = paramValue ? parseInt(paramValue, 10) : undefined;
      }
    }
  }

  return resourceId ? resourceId : undefined;
}

// Get the first parameter name that has a value of [id] in the targetUrl
function getFirstParamNameWithIdValue(targetUrl: string): string | null {
  const queryString = targetUrl.split('?')[1];
  if (!queryString) return null;

  const params = new URLSearchParams(queryString);

  let paramName: string | null = null;

  params.forEach((value, key) => {
    if (paramName === null && value === '[id]') {
      paramName = key;
    }
  });

  return paramName;
}

export {
  getResourceId as default,
  getResourceId,
  getFirstParamNameWithIdValue,
};
