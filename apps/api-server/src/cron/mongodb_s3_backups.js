const fs     = require('fs');
const moment = require('moment')
const {exec} = require('child_process');
const s3     = require('../services/awsS3');
const util   = require('util');

const backupMongoDBToS3 = async () => {
  if (!!process.env.PREVENT_BACKUP_CRONJOBS === true) {
    return;
  }
  
  console.log('backing up to mongodb', process.env.S3_MONGO_BACKUPS);
  
  if (process.env.S3_MONGO_BACKUPS === 'ON') {
    const host            = process.env.MONGO_DB_HOST || 'localhost';
    const port            = process.env.MONGO_DB_PORT || 27017;
    const tempFile        = 'db_mongo';
    const isOnK8s         = !!process.env.KUBERNETES_NAMESPACE;
    const namespace       = process.env.KUBERNETES_NAMESPACE;
    const created = moment().format('YYYY-MM-DD hh:mm:ss')
    const fileNameInS3 = isOnK8s ? `mongodb/${namespace}/mongo_${created}` : `mongodb/mongo_${created}`;
    const deleteTempFile = () => {
      try {
        console.log ('removing temp file', tempFile);
        fs.unlinkSync(tempFile);
      } catch (e) {
        console.error('error removing file', tempFile, e);
      }
    };
    
    // Default command, does not considers username or password
    let command = `mongodump -h ${host} --port=${port} --archive=${tempFile}`;
    
    const promiseExec = util.promisify(exec);
    
    return promiseExec(command, async (err, stdout, stderr) => {
      if (err) {
        // Most likely, mongodump isn't installed or isn't accessible
        console.error(`mongodump command error: ${err}`);
        deleteTempFile();
        return;
      }
      
      const statsFile = fs.statSync(tempFile);
      console.info(`file size: ${Math.round(statsFile.size / 1024 / 1024)}MB`);

      try {
        await s3.uploadFile(tempFile, fileNameInS3);
        deleteTempFile();
        console.log('successfully uploaded to s3');
      } catch (e) {
        deleteTempFile();
        throw e;
      }
      
    });
  }
}


/*
  ENV values needed:

  MONGO_DB_HOST
  S3_DBS_TO_BACKUP
  S3_ENDPOINT
  S3_KEY
  S3_SECRET
  S3_MYSQL_BUCKET
 */

module.exports = {
	cronTime: '0 0 1 * * *',
	runOnInit: true,
	onTick: async function() {
    return backupMongoDBToS3();
	}
};
