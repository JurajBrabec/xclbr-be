import * as k8s from '@kubernetes/client-node';

export type K8sGeneralOptions = {
  url: string;
  user: string;
  accessToken: string;
  namespace: string;
};

export type K8sDeploymentPorts = {
  containerPort: number;
  protocol: 'TCP' | 'UDP';
}[];

export type K8sDeploymentVolumeMounts = {
  name: string;
  mountPath: string;
  subPath: string;
}[];

export type K8sDeploymentVolumes = {
  name: string;
  persistentVolumeClaim: { claimName: string };
}[];

export class K8sGeneral {
  private k8sCoreClient: k8s.CoreV1Api;
  private k8sAppsClient: k8s.AppsV1Api;
  private k8sAutoscalingClient: k8s.AutoscalingV2Api;
  private k8sWatch: k8s.Watch;

  constructor(readonly options: K8sGeneralOptions) {
    const k8sConfig = this.createK8sConfig(options);

    this.k8sCoreClient = k8sConfig.makeApiClient(k8s.CoreV1Api);
    this.k8sAppsClient = k8sConfig.makeApiClient(k8s.AppsV1Api);
    this.k8sAutoscalingClient = k8sConfig.makeApiClient(k8s.AutoscalingV2Api);

    this.k8sWatch = new k8s.Watch(k8sConfig);
  }

  private createK8sConfig(
    options: K8sGeneralOptions,
    cluster: string = 'lab',
    context?: string
  ): k8s.KubeConfig {
    const { url, namespace, user, accessToken } = options;

    const k8sConfig = new k8s.KubeConfig();
    k8sConfig.loadFromOptions({
      clusters: [
        {
          name: cluster, // TODO what name to use here?
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
          name: context || cluster,
          cluster,
          user,
          namespace,
        },
      ],
      currentContext: context || cluster,
    });

    return k8sConfig;
  }

  async listNamespaces(): Promise<string[]> {
    const namespaces: string[] = [];

    const response = await this.k8sCoreClient.listNamespace();
    for (const namespace of response.body.items) {
      namespaces.push(namespace.metadata?.name || '');
    }

    return namespaces;
  }

  private watcher(
    path: string,
    action: string,
    queryParams: any = {},
    timeOut: number = 10000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        req.then((res) => res.abort()).catch((err) => reject(err));
        reject('Watcher timed out');
      }, timeOut);
      const req = this.k8sWatch.watch(
        path,
        queryParams,
        (phase, apiObj) => {
          if (phase === 'ADDED') {
            switch (apiObj.kind) {
              case 'Namespace':
                if (action === 'create' && apiObj.status.phase === 'Active') {
                  clearTimeout(timeout);
                  req.then((res) => res.abort()).catch((err) => reject(err));
                  resolve(apiObj);
                }
                break;
              default:
                console.log(`unknown kind: ${apiObj.kind}`);
                break;
            }
          } else if (phase === 'MODIFIED') {
            switch (apiObj.kind) {
              case 'Namespace':
                if (
                  action === 'delete' &&
                  apiObj.status.phase === 'Terminating'
                ) {
                  console.log('Deleting');
                }
                break;
              default:
                console.log(`unknown kind: ${apiObj.kind}`);
                break;
            }
          } else if (phase === 'DELETED') {
            switch (apiObj.kind) {
              case 'Namespace':
                if (
                  action === 'delete' &&
                  apiObj.status.phase === 'Terminating'
                ) {
                  clearTimeout(timeout);
                  req.then((res) => res.abort()).catch((err) => reject(err));
                  resolve(apiObj);
                }
                break;
              default:
                console.log(`unknown kind: ${apiObj.kind}`);
                break;
            }
          } else {
            console.log(`unknown type: ${phase}`);
          }
        },
        (err) => {
          clearTimeout(timeout);
          reject(err);
        }
      );
    });
  }

  async checkAutoScalerExists(
    namespace: string,
    name: string
  ): Promise<boolean> {
    try {
      const autoScaler =
        await this.k8sAutoscalingClient.readNamespacedHorizontalPodAutoscaler(
          name,
          namespace
        );

      return autoScaler.body !== undefined;
    } catch (error) {
      // TODO Check error is 404 NOT FOUND, otherwise rethrow
    }

    return false;
  }

  createAutoScalerConfig(name: string): k8s.V2HorizontalPodAutoscaler {
    return {
      apiVersion: 'autoscaling/v2',
      kind: 'HorizontalPodAutoscaler',
      metadata: { name },
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name,
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
  }

  async createAutoScaler(
    namespace: string,
    config: k8s.V2HorizontalPodAutoscaler
  ): Promise<void> {
    try {
      if (!config.metadata?.name) {
        throw new Error('No namespace provided');
      }
      const name = config.metadata.name;
      console.log('Creating autoscaler:', name);
      await this.k8sAutoscalingClient.createNamespacedHorizontalPodAutoscaler(
        namespace,
        config
      );
      console.log('Autoscaler creation request submitted');
      //   await this.watcher(
      //     `/apis/apps/v1/namespaces/${namespace}/deployments`,
      //     'create',
      //     {
      //       fieldSelector: `metadata.name=${name}`,
      //     }
      //   );
      console.log('Autoscaler created:', name);
    } catch (error) {
      console.log('Autoscaler NOT created:', error);
    }
  }

  async deleteAutoScaler(namespace: string, name: string): Promise<void> {
    try {
      console.log('Deleting autoscaler:', name);
      await this.k8sAutoscalingClient.deleteNamespacedHorizontalPodAutoscaler(
        name,
        namespace
      );
      console.log('Autoscaler deletion request submitted');
      //   await this.watcher(
      //     `/apis/apps/v1/namespaces/${namespace}/deployments`,
      //     'delete',
      //     {
      //       fieldSelector: `metadata.name=${name}`,
      //     }
      //   );
      console.log('Autoscaler deleted:', name);
    } catch (error) {
      console.log('Autoscaler NOT deleted:', error);
    }
  }

  async checkDeploymentExists(
    namespace: string,
    name: string
  ): Promise<boolean> {
    try {
      const deployment = await this.k8sAppsClient.readNamespacedDeployment(
        name,
        namespace
      );

      return deployment.body !== undefined;
    } catch (error) {
      // TODO Check error is 404 NOT FOUND, otherwise rethrow
    }
    return false;
  }

  createDeploymentConfig(
    name: string,
    app: string,
    image: string,
    ports: K8sDeploymentPorts,
    volumeMounts: K8sDeploymentVolumeMounts = [],
    volumes: K8sDeploymentVolumes = []
  ): k8s.V1Deployment {
    return {
      kind: 'Deployment',
      apiVersion: 'apps/v1',
      metadata: {
        name,
        labels: {
          deployment: name,
        },
      },
      spec: {
        replicas: 2,
        selector: {
          matchLabels: {
            app,
          },
        },
        template: {
          metadata: {
            labels: {
              app,
            },
          },
          spec: {
            restartPolicy: 'Always',
            serviceAccountName: 'root-account',
            terminationGracePeriodSeconds: 10,
            containers: [
              {
                name: app,
                ports,
                imagePullPolicy: 'Never',
                image,
                resources: {
                  limits: {
                    cpu: '1',
                    // memory: "512Mi",
                  },
                },
                volumeMounts,
              },
            ],
            serviceAccount: 'root-account',
            volumes,
          },
        },
      },
    };
  }

  async createDeployment(
    namespace: string,
    config: k8s.V1Deployment
  ): Promise<void> {
    try {
      if (!config.metadata?.name) {
        throw new Error('No namespace provided');
      }
      const name = config.metadata.name;
      console.log('Creating deployment:', name);
      await this.k8sAppsClient.createNamespacedDeployment(namespace, config);
      console.log('Deployment creation request submitted');
      await this.watcher(
        `/apis/apps/v1/namespaces/${namespace}/deployments`,
        'create',
        {
          fieldSelector: `metadata.name=${name}`,
        }
      );
      console.log('Deployment created:', name);
    } catch (error) {
      console.log('Deployment NOT created:', error);
    }
  }

  async deleteDeployment(namespace: string, name: string): Promise<void> {
    try {
      console.log('Deleting deployment:', name);
      await this.k8sAppsClient.deleteNamespacedDeployment(name, namespace);
      console.log('Deployment deletion request submitted');
      await this.watcher(
        `/apis/apps/v1/namespaces/${namespace}/deployments`,
        'delete',
        {
          fieldSelector: `metadata.name=${name}`,
        }
      );
      console.log('Deployment deleted:', name);
    } catch (error) {
      console.log('Deployment NOT deleted:', error);
    }
  }

  async checkServiceExists(
    namespace: string,
    serviceName: string
  ): Promise<boolean> {
    try {
      const service = await this.k8sCoreClient.readNamespacedService(
        serviceName,
        namespace
      );
      return service.body !== undefined;
    } catch (error) {
      // TODO Check error is 404 NOT FOUND, otherwise rethrow
    }
    return false;
  }
  createServiceConfig(
    name: string,
    app: string,
    port: number,
    targetPort?: number
  ): k8s.V1Service {
    return {
      kind: 'Service',
      apiVersion: 'v1',
      metadata: {
        name,
        labels: {
          service: name,
        },
      },
      spec: {
        ipFamilies: ['IPv4'],
        ports: [
          {
            name: `${port}`,
            protocol: 'TCP',
            port,
            targetPort: targetPort || port,
          },
        ],
        type: 'ClusterIP',
        selector: { app },
      },
    };
  }

  async createService(namespace: string, config: k8s.V1Service): Promise<void> {
    try {
      if (!config.metadata?.name) {
        throw new Error('No namespace provided');
      }
      const name = config.metadata.name;
      console.log('Creating service:', name);
      await this.k8sCoreClient.createNamespacedService(namespace, config);
      console.log('Service creation request submitted');
      await this.watcher(
        `/apis/apps/v1/namespaces/${namespace}/services`,
        'create',
        {
          fieldSelector: `metadata.name=${name}`,
        }
      );
      console.log('Service created:', name);
    } catch (error) {
      console.log('Service NOT created:', error);
    }
  }

  async deleteService(namespace: string, name: string): Promise<void> {
    try {
      console.log('Deleting service:', name);
      await this.k8sCoreClient.deleteNamespacedService(name, namespace);
      console.log('Service deletion request submitted');
      await this.watcher(
        `/apis/apps/v1/namespaces/${namespace}/services`,
        'delete',
        {
          fieldSelector: `metadata.name=${name}`,
        }
      );
      console.log('Service deleted:', name);
    } catch (error) {
      console.log('Service NOT deleted:', error);
    }
  }
}
