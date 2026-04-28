const msal = require('@azure/msal-node');

/**
 * @typedef {Object} AzureTransportOptions
 * @property {string} clientId
 * @property {string} clientSecret
 * @property {string} tenantId
 * @property {boolean} [saveToSentItems]
 */

/**
 * AzureTransport sends mail via Microsoft Graph using client credentials.
 *
 * This transport is based on https://dev.to/gevik/sending-emails-via-outlook-with-nodemailer-and-microsoft-graph-b74, but moved to commonjs
 */
class AzureTransport {
  /**
   * @param {AzureTransportOptions} config
   */
  constructor(config) {
    this.name = 'Azure';
    this.config = config;
    this.graphEndpoint = 'https://graph.microsoft.com';
    this.tokenInfo = null;

    this.msalClient = new msal.ConfidentialClientApplication({
      auth: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
      },
    });
  }

  isTokenExpired() {
    if (!this.tokenInfo || !this.tokenInfo.expiresOn) return false;
    return Date.now() > this.tokenInfo.expiresOn.getTime();
  }

  async getAccessToken() {
    if (!this.tokenInfo || this.isTokenExpired()) {
      try {
        this.tokenInfo = await this.msalClient.acquireTokenByClientCredential({
          scopes: [`${this.graphEndpoint}/.default`],
        });

        if (!this.tokenInfo || !this.tokenInfo.accessToken) {
          throw new Error('Failed to acquire access token from Azure.');
        }
      } catch (err) {
        throw new Error('Could not retrieve an access token.');
      }
    }
    return this.tokenInfo.accessToken;
  }

  // Extract only the email address from a string like "Name <email@example.com>"
  // This is needed because Microsoft Graph API expects just the email address.
  returnOnlyEmail(address) {
    const emailMatch = address.match(/<(.+)>/);
    return emailMatch ? emailMatch[1] : address;
  }

  /**
   * Send mail.
   * @param {any} mail - mail object (nodemailer MailMessage-like)
   * @param {(err: Error|null, info: any|null) => void} callback
   */
  async send(mail, callback) {
    try {
      const {
        subject,
        from,
        to,
        text,
        html,
        attachments = [],
      } = (mail && mail.data) || {};

      if (!from || !to) {
        throw new Error("Missing 'from' or 'to' email address.");
      }

      const accessToken = await this.getAccessToken();

      const toRecipients = (Array.isArray(to) ? to : [to]).map((recipient) => ({
        emailAddress: { address: this.returnOnlyEmail(recipient) },
      }));

      const mailMessage = {
        message: {
          subject,
          from: { emailAddress: { address: this.returnOnlyEmail(from) } },
          toRecipients,
          body: {
            content: html || text || '',
            contentType: html ? 'HTML' : 'Text',
          },
          attachments: attachments.map((item) => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: item.filename,
            contentType: item.contentType,
            contentBytes: item.content,
          })),
        },
        saveToSentItems: false,
      };

      const response = await fetch(
        `${this.graphEndpoint}/v1.0/users/${this.returnOnlyEmail(
          from
        )}/sendMail`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mailMessage),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          `Failed to send email. Status: ${response.status} - ${response.statusText}`
        );
      }

      const responseData = await response.text();
      callback(null, responseData);
    } catch (err) {
      console.error('Error sending email:', err);
      callback(err, null);
    }
  }
}

module.exports = AzureTransport;
