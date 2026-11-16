const isLoginTokenForProject = (query, projectId) => {
  if (!query.openstadlogintoken) return false;
  if (!query.openstadprojectid) return true;
  return String(query.openstadprojectid) === String(projectId);
};

module.exports = { isLoginTokenForProject };
