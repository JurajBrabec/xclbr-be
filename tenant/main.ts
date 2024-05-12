import { OAuth2Options, OAuth2Token, getOAuth2Token } from './oauth2';
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

getOAuth2Token(oAuth2Options)
  .then((accessToken: OAuth2Token) => {
    const tenantProvisionerOptions: K8sTenantProvisionerOptions = {
      url,
      user: 'pato@xclbr.com',
      accessToken,
      namespace: 'excalibur-pam',
    };
    const provisioner = new K8sTenantProvisioner(tenantProvisionerOptions);
    return provisioner.createTenant(tenantID);
  })
  .then(() => {
    console.log('Success');
  })
  .catch((error) => {
    console.error('Error', error);
    process.exit(1);
  });
