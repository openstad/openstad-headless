const dns = require('dns');
const db = require('../db');
const k8s = require('@kubernetes/client-node');
const ip = require('ip');

const getK8sApi = () => {
  const kc = new k8s.KubeConfig();
  kc.loadFromCluster();
  return kc.makeApiClient(k8s.NetworkingV1Api);
};

const lookupPromise = async (domain) => {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, family) => {
      if(err) reject(err);
      resolve(address);
    });
  });
};

const getDomainIp = async (domain) => {
  try {
    return await lookupPromise(domain);
  } catch(error) {
    // Todo: log something

    return null;
  }
};

const getIngress = async (k8sApi, name, namespace) => {
  try {
    return await k8sApi.readNamespacedIngress(name, namespace);
  } catch(error) {
    //Todo: log something
    console.log(error);

    return null;
  }
};

const updateIngress = async (ingress, k8sApi, name, domain, namespace) => {
  // Check if domain is in the current ingress, otherwise
  // if there is only one host, replace it
  // if there are multiple hosts, add it
  const hosts = ingress.spec.rules.map(rule => rule.host);
  if (!hosts.includes(domain)) {
    if (hosts.length === 1) {
      ingress.spec.rules[0].host = domain;
    } else {
      ingress.spec.rules.push({
        host: domain,
        http: {
          paths: [{
            backend: {
              service: {
                name: process.env.KUBERNETES_FRONTEND_SERVICE_NAME || 'openstad-frontend',
                port: {
                  number: process.env.KUBERNETES_FRONTEND_SERVICE_PORT ? parseInt(process.env.KUBERNETES_FRONTEND_SERVICE_PORT) : 4444
                }
              }
            },
            path: '/',
            pathType: 'Prefix',
          }]
        }
      });
    }
  }
  
  return k8sApi.replaceNamespacedIngress(name, namespace, ingress);
}

const createIngress = async (k8sApi, name, domain, namespace) => {
  return k8sApi.createNamespacedIngress(namespace, {
    apiVersions: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      //name must be unique, lowercase, alphanumer, - is allowed
      name: `${name}`,
      annotations: {
         'cert-manager.io/cluster-issuer': 'openstad-letsencrypt-prod',
         'kubernetes.io/ingress.class': 'nginx',
         // if www host isset it redirects always to www. if without is isset it redirects to not www
         'nginx.ingress.kubernetes.io/from-to-www-redirect': "true",
        'nginx.ingress.kubernetes.io/proxy-body-size': '128m',
        'nginx.ingress.kubernetes.io/configuration-snippet': `more_set_headers "X-Content-Type-Options: nosniff";
more_set_headers "X-Frame-Options: SAMEORIGIN";
more_set_headers "X-Xss-Protection: 1";
more_set_headers "Referrer-Policy: same-origin";`
      }
    },
    spec: {
      rules: [{
        host: domain,
        http: {
          paths: [{
            // todo make this dynamic
            backend: {
              service: {
                name: process.env.KUBERNETES_FRONTEND_SERVICE_NAME || 'openstad-frontend',
                port: {
                  number: process.env.KUBERNETES_FRONTEND_SERVICE_PORT ? parseInt(process.env.KUBERNETES_FRONTEND_SERVICE_PORT) : 4444
                }
              }
            },
            path: '/',
            pathType: 'Prefix',
          }]
        }
      }],
      tls: [{
        secretName: name,
        hosts: [domain]
      }]
    }
  })
};

const checkHostStatus = async (conditions) => {
  const isOnK8s = !!process.env.KUBERNETES_NAMESPACE;
  const namespace = process.env.KUBERNETES_NAMESPACE;
  const where = conditions ? conditions : {};
  const serverIp = process.env.PUBLIC_IP ? process.env.PUBLIC_IP : ip.address();

  if (isOnK8s) {

    console.log('Server IP should be: ', serverIp, ' IP from env value is: ', process.env.PUBLIC_IP, ' npm thinks it is:', ip.address());

    const projects = await db.Project.findAll({where});

    const promises = projects.map(async (project) => {
      // Todo: skip the projects with hostStatus.status === true?

      if (!project.url) {
        console.error('No url found for project: ', project.id);
        return;
      }
      
      let hostStatus = project.hostStatus;
      //ensure it's an object so we dont have to worry about checks later
      hostStatus = hostStatus ? hostStatus : {};          //

      const domainIp = await getDomainIp(project.url);

      hostStatus.dnsRecordIsSetToCorrectIp = domainIp !== null && domainIp === serverIp;

      const k8sApi = getK8sApi();
      
      let ingress = '';
      
      // Create a uniqueId if for some reason it's not set yet
      if (!project.config.uniqueId) {
        project.config = {...project.config, uniqueId: Math.round(new Date().getTime() / 1000) + project.url.replace(/\W/g, '').slice(0,40)};
        await project.save();
      }
      
      if (project && project.config && project.config.uniqueId) {
        // get ingress config files
        ingress = await getIngress(k8sApi, project.config.uniqueId, namespace);
      }
      
      // if ip issset but not ingress try to create one
      if (hostStatus.dnsRecordIsSetToCorrectIp && !ingress) {
        try {
          const response     = await createIngress(k8sApi, project.config.uniqueId, project.url, namespace);
          hostStatus.ingress = true;
        } catch (error) {
          // don't set to false, an error might just be that it already exist and the read check failed
          console.error(`Error creating ingress for ${project.uniqueId} domain: ${project.url} : ${error}`);
        }
      } else if (hostStatus.dnsRecordIsSetToCorrectIp && ingress) {
        try {
          hostStatus.ingress = true;
          const response = await updateIngress(ingress, k8sApi, project.config.uniqueId, project.url, namespace);
        } catch (error) {
          console.error(`Error updating ingress for ${project.config.uniqueId} domain: ${project.url} : ${error}`);
        }
      // else if ip is not set but ingress is set, remove the ingress file
      } else  if (!hostStatus.dnsRecordIsSetToCorrectIp && ingress) {
        try {
    //      await k8sApi.deleteNamespacedIngress(project.name, namespace)
          hostStatus.ingress = false;
        } catch(error) {
          //@todo how to deal with error here?
          //most likely it doesn't exists anymore if delete doesnt work, but could also be forbidden /
          console.error('Error deleting ingress for ', project.uniqueId, ' domain: ', project.url, ' :', error);
        }
      }

      return await project.update({hostStatus});
    });

    await Promise.all(promises);

  }

  // Todo: some output?
  console.log('all projects checked');
};

module.exports = checkHostStatus;
