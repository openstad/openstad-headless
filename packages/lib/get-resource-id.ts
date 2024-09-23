function getResourceId({
  resourceId,
  url,
  targetUrl
}: {
  resourceId?: number;
  url: string;
  targetUrl?: string;
}): number|undefined {

  console.log("Start getResourceId function");
  console.log("Initial resourceId (direct input):", resourceId);
  console.log("URL being processed:", url);
  console.log("Target URL template:", targetUrl);

  // Methode 1: Resource ID is direct meegegeven
  if (resourceId) {
    console.log("Methode 1: Using directly provided resourceId:", resourceId);
    return resourceId;
  }

  if (!targetUrl) targetUrl = '?openstadResourceId=[id]';

  // Methode 2: Resource ID ophalen via reguliere expressie uit de URL
  let regex = targetUrl.replace(/([.^$*+?()[\]{\|/])/g, "\\$1");
  regex = regex.replace(/\\\[id\\\]/, "(\\d+)");
  console.log("Methode 2: Regex constructed for matching URL:", regex);

  let match = url.match(regex);
  console.log("Methode 2: Match result from URL:", match);

  if (match) {
    resourceId = parseInt(match[1]);
    console.log("Methode 2: ResourceId successfully extracted from URL match:", resourceId);
  }

  // Methode 3: Resource ID ophalen door pad en query parameters apart te verwerken
  if (!resourceId) {
    console.log("Methode 2 failed. Proceeding to Methode 3: Extracting resourceId from URL path + query.");

    const urlPath = new URL(url).pathname + new URL(url).search;
    console.log("Methode 3: Constructed full URL path + search:", urlPath);

    regex = targetUrl.replace(/([.^$*+?()[\]{\|/])/g, "\\$1");
    regex = regex.replace(/\\\[id\\\]/, "(\\d+)");
    console.log("Methode 3: Regex for matching URL path:", regex);

    match = urlPath.match(regex);
    console.log("Methode 3: Match result from URL path:", match);

    if (match) {
      resourceId = parseInt(match[1]);
      console.log("Methode 3: ResourceId successfully extracted from URL path match:", resourceId);
    }

    // Methode 4: Resource ID ophalen via URLSearchParams (kijken naar query parameters)
    if (!resourceId) {
      console.log("Methode 3 failed. Proceeding to Methode 4: Extracting resourceId from URL search parameters.");

      const urlParams = new URLSearchParams(window.location.search);
      const paramValue = urlParams.get(targetUrl.replace(/[?&]\[id\]/, ''));
      console.log("Methode 4: Extracted param value:", paramValue);

      resourceId = paramValue ? parseInt(paramValue, 10) : undefined;
      console.log("Methode 4: ResourceId from URL params (after parse):", resourceId);

      // Methode 5: Extra controle op [id] patroon in targetUrl en query parameter
      if (!resourceId && targetUrl.includes('[id]')) {
        console.log("Methode 4 failed. Proceeding to Methode 5: Searching for [id] pattern in targetUrl.");

        const paramNameMatch = targetUrl.match(/[?&]([^=]+)=\[id\]/);
        console.log("Methode 5: Param name match result:", paramNameMatch);

        if (paramNameMatch && paramNameMatch[1]) {
          const paramName = paramNameMatch[1];
          const paramValue = urlParams.get(paramName);
          console.log("Methode 5: Param value for name", paramName, ":", paramValue);

          resourceId = paramValue ? parseInt(paramValue, 10) : undefined;
          console.log("Methode 5: Final extracted resourceId from param name match:", resourceId);
        }
      }
    }
  }

  console.log("Returning final resourceId:", resourceId ? resourceId : "undefined");
  return resourceId ? resourceId : undefined;
}

export {
  getResourceId as default,
  getResourceId,
}


