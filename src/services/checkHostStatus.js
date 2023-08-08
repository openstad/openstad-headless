const dns = require('dns');
const db = require('../db');
const k8s = require('@kubernetes/client-node');
const ip = require('ip');

const getK8sApi = () => {
  const kc = new k8s.KubeConfig();
  kc.loadFromCluster();
  return kc.makeApiClient(k8s.NetworkingV1beta1Api);
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
        secretName: dbName,
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

  console.log('Server IP should be: ', serverIp, ' IP from env value is: ', process.env.PUBLIC_IP, ' npm thinks it is:', ip.address());

  const projects = await db.Project.findAll({where});

  const promises = projects.map(async (project) => {
    // Todo: skip the projects with hostStatus.status === true?

    let hostStatus = project.hostStatus;
    //ensure it's an object so we dont have to worry about checks later
    hostStatus = hostStatus ? hostStatus : {};          //

    const domainIp = getDomainIp(project.domain);

    hostStatus.ip = domainIp !== null && domainIp === serverIp ? true : false;

    if (isOnK8s) {
      const k8sApi = getK8sApi();

      // get ingress config files
      const ingress = getIngress(k8sApi, project.name, namespace);

      // if ip issset but not ingress try to create one
      if (hostStatus.ip  && !ingress) {
        try {
          const response = await createIngress(k8sApi, project.name, project.domain, namespace);
          hostStatus.ingress = true;
        } catch(error) {
          // don't set to false, an error might just be that it already exist and the read check failed
          console.error('Error updating ingress for ', project.name, ' domain: ', project.domain, ' :', error);
        }
      // else if ip is not set but ingress is set, remove the ingress file
      } else  if (!hostStatus.ip  && ingress) {
        try {
    //      await k8sApi.deleteNamespacedIngress(project.name, namespace)
          hostStatus.ingress = false;
        } catch(error) {
          //@todo how to deal with error here?
          //most likely it doesn't exists anymore if delete doesnt work, but could also be forbidden /
          console.error('Error deleting ingress for ', project.name, ' domain: ', project.domain, ' :', error);
        }
      }
    }

    return await project.update({hostStatus});
  });

  await Promise.all(promises);

  // Todo: some output?
  console.log('all projects checked');
};

module.exports = checkHostStatus;
