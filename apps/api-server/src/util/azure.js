const { WorkloadIdentityCredential } = require("@azure/identity");

const scope = 'https://ossrdbms-aad.database.windows.net/.default'

// This relies on environment variables that get injected.
// AZURE_AUTHORITY_HOST:       (Injected by the webhook)
// AZURE_CLIENT_ID:            (Injected by the webhook)
// AZURE_TENANT_ID:            (Injected by the webhook)
// AZURE_FEDERATED_TOKEN_FILE: (Injected by the webhook)
const credential = new WorkloadIdentityCredential()

const getAzureAuthToken = async () => (await credential.getToken(scope)).token

module.exports = { getAzureAuthToken };