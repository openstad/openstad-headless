const dns = require('dns');
const db = require('../db');
const externalCertificates = require('./externalCertificates');
const externalCertificatesManager = require('./externalCertificatesManager');
const { getCertificateConfig, buildIngressConfig } = require('./checkHostStatusHelpers');

const getK8sApi = async () => {
  const k8s = await import('@kubernetes/client-node');
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

const getIngress = async (k8sApi, name, namespace) => {
  try {
    return await k8sApi.readNamespacedIngress({
      name,
      namespace
    });
  } catch(error) {
    //Todo: log something
    console.log(error);

    return null;
  }
};

/*
Allow extra hosts to be set for TLS, e.g. for www redirection
You can add the array tlsExtraDomains in the project config
And add the redirection in the default Kubernetes annotations
*/
function getIngressHosts(domain, tlsExtraDomains) {
  const hosts = [domain];

  if (tlsExtraDomains && Array.isArray(tlsExtraDomains)) {
    tlsExtraDomains.forEach(extraDomain => {
      if (!hosts.includes(extraDomain)) {
        hosts.push(extraDomain);
      }
    });
  }
  return hosts;
}

const updateIngress = async (ingress, k8sApi, name, domain, namespace, tlsSecretName, tlsExtraDomains, useClusterIssuer = false, useExternalCerts = false) => {
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

  // Rebuild annotations and ingressClassName on every update
  const { annotations, ingressClassName } = buildIngressConfig(useClusterIssuer, useExternalCerts);
  ingress.metadata.annotations = annotations;
  if (ingressClassName) {
    ingress.spec.ingressClassName = ingressClassName;
  } else {
    delete ingress.spec.ingressClassName;
  }

  // Set TLS hosts if managed by OpenStad
  if (process.env.KUBERNETES_INGRESS_TLS_MANAGED_BY_OPENSTAD === 'true') {
    if (tlsSecretName) {
      const hosts = getIngressHosts(domain, tlsExtraDomains);

      ingress.spec.tls = [{
        secretName: tlsSecretName,
        hosts
      }];
    } else {
      // Remove TLS section if secret is not ready (for external certs)
      delete ingress.spec.tls;
    }
  }

  return k8sApi.replaceNamespacedIngress({
    name,
    namespace,
    body: ingress
  });
}


const createIngress = async (k8sApi, name, domain, namespace, tlsSecretName, tlsExtraDomains, useClusterIssuer, useExternalCerts = false) => {

  const { annotations, ingressClassName } = buildIngressConfig(useClusterIssuer, useExternalCerts);

  let hosts = [domain];

  // Set TLS hosts if managed by OpenStad
  if (process.env.KUBERNETES_INGRESS_TLS_MANAGED_BY_OPENSTAD === 'true') {
    hosts = getIngressHosts(domain, tlsExtraDomains);
  }

  const spec = {
    rules: [{
      host: domain,
      http: {
        paths: [{
          // todo make this dynamic
          backend:  {
            service: {
              name: process.env.KUBERNETES_FRONTEND_SERVICE_NAME || 'openstad-frontend',
              port: {
                number: process.env.KUBERNETES_FRONTEND_SERVICE_PORT ? parseInt(process.env.KUBERNETES_FRONTEND_SERVICE_PORT) : 4444,
              },
            },
          },
          path:     '/',
          pathType: 'Prefix',
        }],
      },
    }],
  };

  // Only add TLS if tlsSecretName is provided (for external certs, null means pending)
  if (tlsSecretName) {
    spec.tls = [{
      secretName: tlsSecretName,
      hosts,
    }];
  }

  if (ingressClassName) {
    spec.ingressClassName = ingressClassName;
  }

  return k8sApi.createNamespacedIngress({
    namespace,
    body: {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        //name must be unique, lowercase, alphanumer, - is allowed
        name: `${name}`,
        annotations,
      },
      spec
    }
  })
};

const checkHostStatus = async (conditions) => {
  const isOnK8s = !!process.env.KUBERNETES_NAMESPACE;
  const namespace = process.env.KUBERNETES_NAMESPACE;
  const where = conditions ? conditions : {};

  if (isOnK8s) {
    
    const defaultProjectHost = new URL(process.env.CMS_URL).host;
    const projects = await db.Project.findAll({ where });
    
    const promises = projects.map(async (project) => {
      // Todo: skip the projects with hostStatus.status === true?
      
      if (!project.url) {
        console.error('No url found for project: ', project.id);
        return;
      }
      
      if (project.url === defaultProjectHost) {
        console.log('Skipping default project host: ', project.url);
        return;
      }
      
      let hostStatus = project.hostStatus;
      //ensure it's an object so we dont have to worry about checks later
      hostStatus     = hostStatus ? hostStatus : {};          //
      
      const k8sApi = await getK8sApi();
      let ingress = '';
      
      // Create a uniqueId if for some reason it's not set yet
      if (!project.config.uniqueId) {
        project.config = { ...project.config, uniqueId: Math.round(new Date().getTime() / 1000) + project.url.replace(/\W/g, '').slice(0, 40) };
        await project.save();
      }
      
      if (project && project.config && project.config.uniqueId) {
        // get ingress config files
        ingress = await getIngress(k8sApi, project.config.uniqueId, namespace);
      }
      
      // Allow the TLS secret name to be set in the project config
      const tlsSecretName = project.config?.tlsSecretName ? project.config.tlsSecretName : project.config.uniqueId;
      const tlsExtraDomains = project.config?.tlsExtraDomains ? project.config.tlsExtraDomains : [];
      const tlsUseClusterIssuer = project.config?.tlsSecretName ? false : process.env.KUBERNETES_INGRESS_USE_CLUSTER_ISSUER === 'true';

      // Read certificate config from new path with fallback
      const certConfig = getCertificateConfig(project.config);

      // External certificates: per-project cert method choice
      // When global flag is on AND project is configured for external certs,
      // external cert logic runs instead of cert-manager logic.
      const useExternalCerts = externalCertificates.isEnabled() && certConfig.certificateMethod === 'external';

      // External certificate branching: create ExternalSecret and dual-check readiness
      if (useExternalCerts) {
        const slugOverride = certConfig.externalCertSlug || null;
        const secretName = externalCertificatesManager.generateSecretName(
          project.url, namespace, slugOverride
        );

        try {
          await externalCertificatesManager.ensureExternalSecret(secretName, namespace);
        } catch (error) {
          console.error(`[external-certificates] Failed to ensure ExternalSecret for project ${project.id}: ${error.message}`);
          hostStatus.certificate = { method: 'external', state: 'error', secretName, lastChecked: new Date().toISOString() };
          await project.update({ hostStatus });
          return;
        }

        const certStatus = await externalCertificatesManager.waitForSecretReady(secretName, namespace);

        hostStatus.certificate = {
          method: 'external',
          state: certStatus.state,
          secretName,
          lastChecked: new Date().toISOString()
        };

        if (!ingress) {
          try {
            if (certStatus.ready) {
              await createIngress(k8sApi, project.config.uniqueId, project.url, namespace, secretName, tlsExtraDomains, false, true);
            } else {
              await createIngress(k8sApi, project.config.uniqueId, project.url, namespace, null, tlsExtraDomains, false, true);
            }
            hostStatus.ingress = true;
          } catch (error) {
            console.error(`Error creating ingress for ${project.config.uniqueId} domain: ${project.url} : ${error}`);
          }
        } else {
          try {
            hostStatus.ingress = true;
            if (certStatus.ready) {
              await updateIngress(ingress, k8sApi, project.config.uniqueId, project.url, namespace, secretName, tlsExtraDomains, false, true);
            } else {
              await updateIngress(ingress, k8sApi, project.config.uniqueId, project.url, namespace, null, tlsExtraDomains, false, true);
            }
          } catch (error) {
            console.error(`Error updating ingress for ${project.config.uniqueId} domain: ${project.url} : ${error}`);
          }
        }

        await project.update({ hostStatus });
        return; // Skip the default cert-manager path below
      }

      // if ip issset but not ingress try to create one
      if (!ingress) {
        try {
          const response = await createIngress(k8sApi, project.config.uniqueId, project.url, namespace, tlsSecretName, tlsExtraDomains, tlsUseClusterIssuer);
          hostStatus.ingress = true;
        } catch (error) {
          // don't set to false, an error might just be that it already exist and the read check failed
          console.error(`Error creating ingress for ${project.config.uniqueId} domain: ${project.url} : ${error}`);
        }
      } else {
        try {
          hostStatus.ingress = true;
          const response = await updateIngress(ingress, k8sApi, project.config.uniqueId, project.url, namespace, tlsSecretName, tlsExtraDomains, tlsUseClusterIssuer, false);
        } catch (error) {
          console.error(`Error updating ingress for ${project.config.uniqueId} domain: ${project.url} : ${error}`);
        }
      }

      // Save certificate status for cert-manager path
      hostStatus.certificate = {
        method: 'cert-manager',
        state: 'configured',
        lastChecked: new Date().toISOString()
      };
      await project.update({ hostStatus });

    })

    await Promise.all(promises);
  }
};

module.exports = checkHostStatus;
