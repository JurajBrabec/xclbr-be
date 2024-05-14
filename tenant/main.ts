import 'dotenv/config';
//import { OAuth2Options, getOAuth2Token } from './oauth2';
import { OAuthOptions, getOAuthToken } from './oauth';
import {
  K8sTenantProvisionerOptions,
  K8sTenantProvisioner,
} from './k8sTenantProvisioner';

const clientID = process.env.CLIENT_ID || 'openshift-challenging-client';
const clientSecret = process.env.CLIENT_SECRET || 'b64(U:P)';
const namespace = process.env.NAMESPACE || 'excalibur-pam';
const tenantID = 1;
const user = process.env.USER_NAME || 'developer';
const url = process.env.API_ENDPOINT || 'https://api.openshift.com';

// const oAuth2Options: OAuth2Options = {
//   url,
//   clientID: 'client_id',
//   clientSecret: client_secret',
// };

const oAuthOptions: OAuthOptions = {
  url: 'https://oauth-openshift.apps.xclbr-dev.lab.soitron.as',
  clientID,
  clientSecret,
};

async function main() {
  try {
    //    const accessToken = await getOAuth2Token(oAuth2Options);
    const accessToken = await getOAuthToken(oAuthOptions);
    const tenantProvisionerOptions: K8sTenantProvisionerOptions = {
      url,
      user,
      accessToken,
      namespace,
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
