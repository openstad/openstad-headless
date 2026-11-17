/**
 * Resolve which subdirectory site, if any, a request prefix maps to.
 */
function resolveSitePrefix({
  projects,
  openstadDomain,
  sitePrefix,
  alreadyResolved,
}) {
  if (alreadyResolved) {
    return null;
  }

  if (!projects || !openstadDomain || !sitePrefix) {
    return null;
  }

  const domainAndPath = openstadDomain + '/' + sitePrefix;

  return projects[domainAndPath] || null;
}

module.exports = { resolveSitePrefix };
