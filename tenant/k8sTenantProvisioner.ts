import {
  K8sGeneral,
  K8sGeneralOptions,
  K8sDeploymentPorts,
  K8sDeploymentVolumeMounts,
  K8sDeploymentVolumes,
} from './k8sGeneral';

export type K8sTenantProvisionerOptions = K8sGeneralOptions;
export class K8sTenantProvisioner extends K8sGeneral {
  constructor(options: K8sGeneralOptions) {
    super(options);
  }

  private getPAMAutoScalerName(tenantID: number): string {
    return `${this.getPAMDeploymentName(tenantID)}-autoscaler`;
  }
  private getGuacdAutoScalerName(tenantID: number): string {
    return `${this.getGuacdDeploymentName(tenantID)}-autoscaler`;
  }
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

  private async createPAMAutoScaler(tenantID: number): Promise<void> {
    const { namespace } = this.options;
    const name = this.getPAMDeploymentName(tenantID);
    const config = this.createAutoScalerConfig(name);
    return this.createAutoScaler(namespace, config);
  }

  private async createPAMDeployment(tenantID: number): Promise<void> {
    const { namespace } = this.options;
    const name = this.getPAMDeploymentName(tenantID);
    const app = this.getPAMPodName(tenantID);
    const image = 'ghcr.io/excalibur-enterprise/pam';
    const ports: K8sDeploymentPorts = [
      { containerPort: 80, protocol: 'TCP' },
      { containerPort: 8080, protocol: 'TCP' },
    ];
    const volumeMounts: K8sDeploymentVolumeMounts = [
      {
        name: 'pam-recordings',
        mountPath: '/var/excalibur/pam/recordings',
        subPath: 'pam-recordings',
      },
    ];
    const volumes: K8sDeploymentVolumes = [
      {
        name: 'pam-recordings',
        persistentVolumeClaim: { claimName: 'database' }, // TODO Use the correct claim name
      },
    ];

    const config = this.createDeploymentConfig(
      name,
      app,
      image,
      ports,
      volumeMounts,
      volumes
    );
    return this.createDeployment(namespace, config);
  }
  private async createPAMService(tenantID: number): Promise<void> {
    const { namespace } = this.options;
    const name = this.getPAMServiceName(tenantID);
    const app = this.getPAMPodName(tenantID);
    const config = this.createServiceConfig(name, app, 8080);
    return this.createService(namespace, config);
  }

  private async createGuacdAutoScaler(tenantID: number): Promise<void> {
    const { namespace } = this.options;
    const name = this.getGuacdDeploymentName(tenantID);
    const autoScaler = this.createAutoScalerConfig(name);
    return this.createAutoScaler(namespace, autoScaler);
  }

  private async createGuacdDeployment(tenantID: number): Promise<void> {
    const { namespace } = this.options;
    const name = this.getGuacdDeploymentName(tenantID);
    const app = this.getGuacdPodName(tenantID);
    const image = 'guacamole/guacd';
    const ports: K8sDeploymentPorts = [
      { containerPort: 4822, protocol: 'TCP' },
    ];
    const config = this.createDeploymentConfig(name, app, image, ports);
    return this.createDeployment(namespace, config);
  }

  private async createGuacdService(tenantID: number): Promise<void> {
    const { namespace } = this.options;
    const name = this.getGuacdServiceName(tenantID);
    const app = this.getGuacdPodName(tenantID);
    const config = this.createServiceConfig(name, app, 4822);
    return this.createService(namespace, config);
  }

  public async createTenant(tenantID: number): Promise<void> {
    const deployK8sFor = async (type: 'PAM' | 'Guacd') => {
      const { namespace } = this.options;
      let autoScalerName: string;
      let autoScalerCreator: Function;
      let deploymentName: string;
      let deploymentCreator: Function;
      let serviceName: string;
      let serviceCreator: Function;
      switch (type) {
        case 'PAM':
          autoScalerName = this.getPAMAutoScalerName(tenantID);
          autoScalerCreator = this.createPAMAutoScaler;
          deploymentName = this.getPAMDeploymentName(tenantID);
          deploymentCreator = this.createPAMDeployment;
          serviceName = this.getPAMServiceName(tenantID);
          serviceCreator = this.createPAMService;
          break;
        case 'Guacd':
          autoScalerName = this.getGuacdAutoScalerName(tenantID);
          autoScalerCreator = this.createGuacdAutoScaler;
          deploymentName = this.getGuacdDeploymentName(tenantID);
          deploymentCreator = this.createPAMDeployment;
          serviceName = this.getGuacdServiceName(tenantID);
          serviceCreator = this.createGuacdService;
          break;
      }

      if (await this.checkServiceExists(namespace, serviceName)) {
        console.log(`${type} service exists`);
        await this.deleteService(namespace, serviceName);
      }
      await serviceCreator(tenantID);

      if (await this.checkDeploymentExists(namespace, deploymentName)) {
        console.log(`${type} deployment exists`);
        await this.deleteDeployment(namespace, deploymentName);
      }
      await deploymentCreator(tenantID);

      if (await this.checkAutoScalerExists(namespace, autoScalerName)) {
        console.log(`${type} autoscaler exists`);
        await this.deleteAutoScaler(namespace, autoScalerName);
      }
      await autoScalerCreator(tenantID);
    };

    deployK8sFor('PAM');
    deployK8sFor('Guacd');
  }
}
