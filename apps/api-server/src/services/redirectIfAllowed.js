const db = require('../db');
const isRedirectAllowed = async (projectId, redirectUri) => {
    if(!projectId || !redirectUri) return false;

    const project = await db.Project.findByPk(projectId);
    if(!project) return false;

    let allowedDomains = (project && project.config && project.config.widgets && project.config.widgets.allowedDomains) || [];
    allowedDomains = allowedDomains.map(domain => {
        let url = new URL(domain);
        // remove wwww 
        if(url.host.startsWith('www.')){
        url.host = url.hostname.slice(4);
        }
        return url.host;
    });

    if(allowedDomains.includes(new URL(redirectUri).host)){
        return true;
    }
    return false;
}

module.exports = isRedirectAllowed;