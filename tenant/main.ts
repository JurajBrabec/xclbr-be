import { OAuth2Options, getOAuth2Token } from './oauth2';
import {
  K8sTenantProvisionerOptions,
  K8sTenantProvisioner,
} from './k8sTenantProvisioner';

const tenantID = 1;
const url = 'https://console-openshift-console.apps.xclbr-dev.lab.soitron.as';

const oAuth2Options: OAuth2Options = {
  url,
  clientID: 'client-id',
  clientSecret: 'client-secret',
};

async function main() {
  try {
    const accessToken = await getOAuth2Token(oAuth2Options);
    const tenantProvisionerOptions: K8sTenantProvisionerOptions = {
      url,
      user: 'juraj@xclbr.com',
      accessToken,
      namespace: 'excalibur-pam',
    };
    const provisioner = new K8sTenantProvisioner(tenantProvisionerOptions);
    const namespaces = await provisioner.listNamespaces();
    console.log('Namespaces', namespaces);
    //    await provisioner.createTenant(tenantID);
  } catch (error) {
    console.error('Error', error);
    process.exit(1);
  }
}

main();
