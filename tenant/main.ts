//import { OAuth2Options, getOAuth2Token } from './oauth2';
import { OAuthOptions, getOAuthToken } from './oauth';
import {
  K8sTenantProvisionerOptions,
  K8sTenantProvisioner,
} from './k8sTenantProvisioner';

const tenantID = 1;
const url = 'https://api.xclbr-dev.lab.soitron.as:6443';

// const oAuth2Options: OAuth2Options = {
//   url,
//   clientID: 'client_id',
//   clientSecret: client_secret',
// };

const oAuthOptions: OAuthOptions = {
  url: 'https://oauth-openshift.apps.xclbr-dev.lab.soitron.as',
  clientID: 'openshift-challenging-client',
  clientSecret: 'anVyYWpAeGNsYnIuY29tOkFZeTN1Y1ktRGk4Jg==',
};

async function main() {
  try {
    //    const accessToken = await getOAuth2Token(oAuth2Options);
    const accessToken = await getOAuthToken(oAuthOptions);
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
