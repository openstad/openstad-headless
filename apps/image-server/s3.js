const { S3Client } = require('@aws-sdk/client-s3');

module.exports = {
  client: null,

  /**
   * @returns {boolean}
   */
  isEnabled: () => {
    return !!process.env.S3_ENDPOINT;
  },
  /**
   * @returns {S3|null}
   */
  getClient: function () {
    if (this.isEnabled() === false) {
      return null;
    }
    if (this.client) {
      return this.client;
    }
    this.client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET,
      },
      region: process.env.S3_REGION || 'us-east-1',
    });

    return this.client;
  }
};
