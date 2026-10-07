// A login token tagged for another project belongs to a widget of that project
// on this page; leave it in the url so the widget can pick it up
const isLoginTokenForProject = (query, projectId) => {
  if (!query.openstadlogintoken) return false;
  if (!query.openstadprojectid) return true;
  return String(query.openstadprojectid) === String(projectId);
};

module.exports = { isLoginTokenForProject };
