import k8s from '@kubernetes/client-node';
import axios from 'axios';

async function oAuth2Authenticate(
  url: string,
  clientID: string,
  clientSecret: string
): Promise<string> {
  const data = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientID,
    client_secret: clientSecret,
    response_type: 'token',
  });

  const { data: response } = await axios.post(url, data);
  const accessToken = response.access_token;

  return accessToken;
}

export type K8sTenantProvisionerOptions = {
  url: string;
  user: string;
  accessToken: string;
  namespace: string;
};

export class K8sTenantProvisioner {
  private k8sCoreClient: k8s.CoreV1Api;
  private k8sAppsClient: k8s.AppsV1Api;
  private k8sAutoscalingClient: k8s.AutoscalingV2Api;
  private k8sWatch: k8s.Watch;

  constructor(private readonly options: K8sTenantProvisionerOptions) {
    const k8sConfig = this.createK8sConfig(options);

    this.k8sCoreClient = k8sConfig.makeApiClient(k8s.CoreV1Api);
    this.k8sAppsClient = k8sConfig.makeApiClient(k8s.AppsV1Api);
    this.k8sAutoscalingClient = k8sConfig.makeApiClient(k8s.AutoscalingV2Api);

    this.k8sWatch = new k8s.Watch(k8sConfig);
  }

  private createK8sConfig(
    options: K8sTenantProvisionerOptions
  ): k8s.KubeConfig {
    const { url, namespace, user, accessToken } = options;

    const k8sConfig = new k8s.KubeConfig();

    k8sConfig.loadFromOptions({
      clusters: [
        {
          name: 'lab', // TODO what name to use here?
          server: url,
          // caFile: path.join(__dirname, "ca.crt"),
          skipTLSVerify: true,
        },
      ],
      users: [
        {
          name: user,
          token: accessToken,
        },
      ],
      contexts: [
        {
          name: 'lab',
          cluster: 'lab',
          user,
          namespace,
        },
      ],
      currentContext: 'lab',
    });

    return k8sConfig;
  }

  private async listNamespaces(k8sClient: k8s.CoreV1Api): Promise<string[]> {
    const namespaces: string[] = [];

    const response = await k8sClient.listNamespace();
    for (const namespace of response.body.items) {
      namespaces.push(namespace.metadata?.name || '');
    }

    return namespaces;
  }

  /**
   * Get the service name for the PAM service for the given tenant.
   *
   * Service name is also its hostname so in order to make requests to start PAM sessions within the specific tenant,
   * the service name is used as the hostname.
   *
   * @param tenantID
   * @returns
   */
  private getPAMServiceName(tenantID: number): string {
    return `service-pam-tenant-${tenantID}`;
  }

  private getGuacdServiceName(tenantID: number): string {
    return `service-guacd-tenant-${tenantID}`;
  }

  private getPAMDeploymentName(tenantID: number): string {
    return `deployment-pam-tenant-${tenantID}`;
  }

  private getGuacdDeploymentName(tenantID: number): string {
    return `deployment-guacd-tenant-${tenantID}`;
  }

  private getPAMPodName(tenantID: number): string {
    return `pam-tenant-${tenantID}`;
  }

  private getGuacdPodName(tenantID: number): string {
    return `guacd-tenant-${tenantID}`;
  }

  private async createService(
    namespace: string,
    serviceName: string,
    service: k8s.V1Service
  ): Promise<void> {
    const waitPromise = new Promise<void>(async (resolve, reject) => {
      let watcher: any = null;

      const timeoutID = setTimeout(() => {
        console.log('Timeout elapsed, aborting watcher...');
        if (watcher) {
          watcher.abort();
        }

        reject(new Error('Timeout elapsed'));
      }, 10000);

      watcher = await this.k8sWatch.watch(
        `/api/v1/namespaces/${namespace}/services`,
        {},
        (type, apiObj, watchObj) => {
          console.log('Service watch event:', type, apiObj?.metadata?.name);

          if (type === 'ADDED' && apiObj?.metadata?.name === serviceName) {
            watcher.abort();

            clearTimeout(timeoutID);
          }
        },
        (error) => {
          console.error('Failed to watch service:', error);
          watcher.abort();

          clearTimeout(timeoutID);

          reject(error);
        }
      );
    });

    console.log('Creating service:', serviceName);

    await this.k8sCoreClient.createNamespacedService(namespace, service);

    console.log('Service creation request submitted');

    await waitPromise;

    console.log('Service created:', serviceName);
  }

  private async deleteService(
    namepsace: string,
    serviceName: string
  ): Promise<void> {
    const waitPromise = new Promise<void>(async (resolve, reject) => {
      let watcher: any = null;

      const timeoutID = setTimeout(() => {
        console.log('Timeout elapsed, aborting watcher...');
        if (watcher) {
          watcher.abort();
        }

        reject(new Error('Timeout elapsed'));
      }, 10000);

      watcher = await this.k8sWatch.watch(
        `/api/v1/namespaces/${namepsace}/services`,
        {},
        (type, apiObj, watchObj) => {
          console.log('Service watch event:', type, apiObj?.metadata?.name);

          if (type === 'DELETED' && apiObj?.metadata?.name === serviceName) {
            watcher.abort();

            clearTimeout(timeoutID);
          }
        },
        (error) => {
          console.error('Failed to watch service:', error);
          watcher.abort();

          clearTimeout(timeoutID);

          reject(error);
        }
      );
    });

    console.log('Deleting service:', serviceName);

    await this.k8sCoreClient.deleteNamespacedService(serviceName, namepsace);

    console.log('Service deletion request submitted');

    await waitPromise;

    console.log('Service deleted:', serviceName);
  }

  private async createDeployment(
    namepsace: string,
    deploymentName: string,
    deployment: k8s.V1Deployment
  ): Promise<void> {
    const waitPromise = new Promise<void>(async (resolve, reject) => {
      let watcher: any = null;

      const timeoutID = setTimeout(() => {
        console.log('Timeout elapsed, aborting watcher...');
        if (watcher) {
          watcher.abort();
        }

        reject(new Error('Timeout elapsed'));
      }, 10000);

      watcher = await this.k8sWatch.watch(
        `/apis/apps/v1/namespaces/${namepsace}/deployments`,
        {},
        (type, apiObj, watchObj) => {
          console.log('Deployment watch event:', type, apiObj?.metadata?.name);

          if (type === 'ADDED' && apiObj?.metadata?.name === deploymentName) {
            watcher.abort();

            clearTimeout(timeoutID);
          }
        },
        (error) => {
          console.error('Failed to watch deployment:', error);
          watcher.abort();

          clearTimeout(timeoutID);

          reject(error);
        }
      );
    });

    console.log('Creating deployment:', deploymentName);

    await this.k8sAppsClient.createNamespacedDeployment(namepsace, deployment);

    console.log('Deployment creation request submitted');

    await waitPromise;

    console.log('Deployment created:', deploymentName);
  }

  private async checkServiceExists(
    namespace: string,
    serviceName: string
  ): Promise<boolean> {
    let exists = false;

    try {
      const service = await this.k8sCoreClient.readNamespacedService(
        serviceName,
        namespace
      );

      exists = service.body !== undefined;
    } catch (error) {
      // TODO Check error is 404 NOT FOUND, otherwise rethrow
    }

    return exists;
  }

  private async checkDeploymentExists(
    namespace: string,
    deploymentName: string
  ): Promise<boolean> {
    let exists = false;

    try {
      const deployment = await this.k8sAppsClient.readNamespacedDeployment(
        deploymentName,
        namespace
      );

      exists = deployment.body !== undefined;
    } catch (error) {
      // TODO Check error is 404 NOT FOUND, otherwise rethrow
    }

    return exists;
  }

  private async deleteDeployment(
    namepsace: string,
    deploymentName: string
  ): Promise<void> {
    const waitPromise = new Promise<void>(async (resolve, reject) => {
      let watcher: any = null;

      const timeoutID = setTimeout(() => {
        console.log('Timeout elapsed, aborting watcher...');
        if (watcher) {
          watcher.abort();
        }

        reject(new Error('Timeout elapsed'));
      }, 10000);

      watcher = await this.k8sWatch.watch(
        `/apis/apps/v1/namespaces/${namepsace}/deployments`,
        {},
        (type, apiObj, watchObj) => {
          console.log('Deployment watch event:', type, apiObj?.metadata?.name);

          if (type === 'DELETED' && apiObj?.metadata?.name === deploymentName) {
            watcher.abort();

            clearTimeout(timeoutID);
          }
        },
        (error) => {
          console.error('Failed to watch deployment:', error);
          watcher.abort();

          clearTimeout(timeoutID);

          reject(error);
        }
      );
    });

    console.log('Deleting deployment:', deploymentName);

    await this.k8sAppsClient.deleteNamespacedDeployment(
      deploymentName,
      namepsace
    );

    console.log('Deployment deletion request submitted');

    await waitPromise;

    console.log('Deployment deleted:', deploymentName);
  }

  private async createPAMService(
    tenantID: number,
    namespace: string
  ): Promise<void> {
    const serviceName = this.getPAMServiceName(tenantID);

    const service: k8s.V1Service = {
      kind: 'Service',
      apiVersion: 'v1',
      metadata: {
        name: serviceName,
        labels: {
          service: serviceName,
        },
      },
      spec: {
        ipFamilies: ['IPv4'],
        ports: [
          {
            name: '8080',
            protocol: 'TCP',
            port: 8080,
            targetPort: 8080,
          },
        ],
        type: 'ClusterIP',
        selector: {
          app: this.getPAMPodName(tenantID),
        },
      },
    };

    await this.createService(namespace, serviceName, service);
  }

  private async createPAMDeployment(
    tenantID: number,
    namespace: string
  ): Promise<void> {
    const deploymentName = this.getPAMDeploymentName(tenantID);
    const podName = this.getPAMPodName(tenantID);

    const deployment: k8s.V1Deployment = {
      kind: 'Deployment',
      apiVersion: 'apps/v1',
      metadata: {
        name: deploymentName,
        labels: {
          deployment: deploymentName,
        },
      },
      spec: {
        replicas: 2,
        selector: {
          matchLabels: {
            app: podName,
          },
        },
        template: {
          metadata: {
            labels: {
              app: podName,
            },
          },
          spec: {
            restartPolicy: 'Always',
            serviceAccountName: 'root-account',
            terminationGracePeriodSeconds: 10,
            containers: [
              {
                name: podName,
                ports: [
                  { containerPort: 80, protocol: 'TCP' },
                  { containerPort: 8080, protocol: 'TCP' },
                ],
                imagePullPolicy: 'Never',
                volumeMounts: [
                  {
                    name: 'pam-recordings',
                    mountPath: '/var/excalibur/pam/recordings',
                    subPath: 'pam-recordings',
                  },
                ],
                image: 'ghcr.io/excalibur-enterprise/pam',
                resources: {
                  limits: {
                    cpu: '1',
                    // memory: "512Mi",
                  },
                },
              },
            ],
            serviceAccount: 'root-account',
            volumes: [
              {
                name: 'pam-recordings',
                persistentVolumeClaim: { claimName: 'database' }, // TODO Use the correct claim name
              },
            ],
          },
        },
      },
    };

    await this.createDeployment(namespace, deploymentName, deployment);
  }

  private async createGuacdService(
    tenantID: number,
    namespace: string
  ): Promise<void> {
    const serviceName = this.getGuacdServiceName(tenantID);
    const service: k8s.V1Service = {
      kind: 'Service',
      apiVersion: 'v1',
      metadata: {
        name: serviceName,
        labels: {
          service: serviceName,
        },
      },
      spec: {
        ipFamilies: ['IPv4'],
        ports: [
          {
            name: '4822',
            protocol: 'TCP',
            port: 4822,
            targetPort: 4822,
          },
        ],
        type: 'ClusterIP',
        selector: {
          app: this.getGuacdPodName(tenantID),
        },
      },
    };

    await this.createService(namespace, serviceName, service);
  }

  private async createGuacdDeployment(
    tenantID: number,
    namespace: string
  ): Promise<void> {
    const deploymentName = this.getGuacdDeploymentName(tenantID);
    const podName = this.getGuacdPodName(tenantID);

    const deployment: k8s.V1Deployment = {
      kind: 'Deployment',
      apiVersion: 'apps/v1',
      metadata: {
        name: deploymentName,
        labels: {
          deployment: deploymentName,
        },
      },
      spec: {
        replicas: 2,
        selector: {
          matchLabels: {
            app: podName,
          },
        },
        template: {
          metadata: {
            labels: {
              app: podName,
            },
          },
          spec: {
            restartPolicy: 'Always',
            serviceAccountName: 'root-account',
            terminationGracePeriodSeconds: 10,
            containers: [
              {
                name: podName,
                ports: [{ containerPort: 4822, protocol: 'TCP' }],
                imagePullPolicy: 'Never',
                image: 'guacamole/guacd',
                resources: {
                  limits: {
                    cpu: '1',
                    // memory: "512Mi",
                  },
                },
              },
            ],
            serviceAccount: 'root-account',
          },
        },
      },
    };

    await this.createDeployment(namespace, deploymentName, deployment);
  }

  private getAutoScalerName(deploymentName: string): string {
    return `${deploymentName}-autoscaler`;
  }

  private async createAutoScaler(
    namespace: string,
    deploymentName: string
  ): Promise<void> {
    const autoScalerName = this.getAutoScalerName(deploymentName);
    const autoScaler: k8s.V2HorizontalPodAutoscaler = {
      apiVersion: 'autoscaling/v2',
      kind: 'HorizontalPodAutoscaler',
      metadata: {
        name: autoScalerName,
      },
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: deploymentName,
        },
        minReplicas: 2,
        maxReplicas: 10,
        metrics: [
          {
            type: 'Resource',
            resource: {
              name: 'cpu',
              target: {
                type: 'Utilization',
                averageUtilization: 90,
              },
            },
          },
          {
            type: 'Resource',
            resource: {
              name: 'memory',
              target: {
                type: 'Utilization',
                averageUtilization: 90,
              },
            },
          },
        ],
      },
    };

    await this.k8sAutoscalingClient.createNamespacedHorizontalPodAutoscaler(
      namespace,
      autoScaler
    );
  }

  private async checkAutoScalerExists(
    namespace: string,
    deploymentName: string
  ): Promise<boolean> {
    let exists = false;

    const autoScalerName = this.getAutoScalerName(deploymentName);

    try {
      const autoScaler =
        await this.k8sAutoscalingClient.readNamespacedHorizontalPodAutoscaler(
          autoScalerName,
          namespace
        );

      exists = autoScaler.body !== undefined;
    } catch (error) {
      // TODO Check error is 404 NOT FOUND, otherwise rethrow
    }

    return exists;
  }

  private async deleteAutoScaler(
    namespace: string,
    autoScalerName: string
  ): Promise<void> {
    await this.k8sAutoscalingClient.deleteNamespacedHorizontalPodAutoscaler(
      autoScalerName,
      namespace
    );
  }

  public async createTenant(tenantID: number): Promise<void> {
    const { namespace } = this.options;

    const pamServiceName = this.getPAMServiceName(tenantID);
    const pamServiceExists = await this.checkServiceExists(
      namespace,
      pamServiceName
    );
    if (pamServiceExists) {
      console.log('PAM service exists');

      await this.deleteService(namespace, pamServiceName);
    }

    this.createPAMService(tenantID, namespace);

    const pamDeploymentName = this.getPAMDeploymentName(tenantID);
    const pamDeploymentExists = await this.checkDeploymentExists(
      namespace,
      pamDeploymentName
    );
    if (pamDeploymentExists) {
      console.log('PAM deployment exists');

      await this.deleteDeployment(namespace, pamDeploymentName);
    }

    this.createPAMDeployment(tenantID, namespace);

    if (await this.checkAutoScalerExists(namespace, pamDeploymentName)) {
      await this.deleteAutoScaler(
        namespace,
        this.getAutoScalerName(pamDeploymentName)
      );
    }

    await this.createAutoScaler(namespace, pamDeploymentName);

    const guacdServiceName = this.getGuacdServiceName(tenantID);
    const guacdServiceExists = await this.checkServiceExists(
      namespace,
      guacdServiceName
    );
    if (guacdServiceExists) {
      console.log('Guacd service exists');

      await this.deleteService(namespace, guacdServiceName);
    }

    this.createGuacdService(tenantID, namespace);

    const guacdDeploymentName = this.getGuacdDeploymentName(tenantID);
    const guacdDeploymentExists = await this.checkDeploymentExists(
      namespace,
      guacdDeploymentName
    );
    if (guacdDeploymentExists) {
      console.log('Guacd deployment exists');

      await this.deleteDeployment(namespace, guacdDeploymentName);
    }

    this.createGuacdDeployment(tenantID, namespace);

    if (await this.checkAutoScalerExists(namespace, guacdDeploymentName)) {
      await this.deleteAutoScaler(
        namespace,
        this.getAutoScalerName(guacdDeploymentName)
      );
    }

    await this.createAutoScaler(namespace, guacdDeploymentName);
  }
}

async function main() {
  try {
    const tenantID = 1;
    const url =
      'https://console-openshift-console.apps.xclbr-dev.lab.soitron.as';

    const accessToken = await oAuth2Authenticate(
      url,
      'client-id',
      'client-secret'
    );

    const options: K8sTenantProvisionerOptions = {
      url,
      user: 'pato@xclbr.com',
      accessToken,
      namespace: 'excalibur-pam',
    };

    const provisioner = new K8sTenantProvisioner(options);
    await provisioner.createTenant(tenantID);
  } catch (error) {
    console.error('Error', error);
    process.exit(1);
  }
}

main();
