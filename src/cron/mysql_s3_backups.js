const mysqldump = require('mysqldump');
const moment = require('moment')
const s3 = require('../services/awsS3');

// Purpose
// -------
// Auto-close ideas that passed the deadline.
//
// Runs every night at 1:00.
const backupMysqlToS3 = async () => {
  if (!!process.env.PREVENT_BACKUP_CRONJOBS === true) {
    return;
  }
  
  const dbsToBackup = process.env.S3_DBS_TO_BACKUP ? process.env.S3_DBS_TO_BACKUP.split(',') : false;
  const isOnK8s = !!process.env.KUBERNETES_NAMESPACE;
  const namespace = process.env.KUBERNETES_NAMESPACE;
  
  if (dbsToBackup) {
    dbsToBackup.forEach(async function(dbName) {
      // return the dump from the function and not to a file

      const result = await mysqldump({
          connection: {
              host: process.env.API_DATABASE_HOST,
              user: process.env.API_DATABASE_USER,
              password: process.env.API_DATABASE_PASSWORD,
              database: dbName.trim(),
          },
          // Exclude areas for now
          // Mysql dump fails on geo polygons field
          dump : {
            tables: ['areas'],
            excludeTables: true
          }
      });

      const created = moment().format('YYYY-MM-DD hh:mm:ss')

      const key = isOnK8s ? `mysql/${namespace}/${dbName}_${created}sql` : `mysql/${dbName}_${created}sql`;

      var params = {
          Bucket: process.env.S3_BUCKET,
          Key: key,
          Body: result.dump.data,
          ACL: "private"
      };
      
      const client = s3.getClient();

      client.putObject(params, function(err, data) {
          if (err) console.log(err, err.stack);
          else     console.log(data);
      });

    });

  }
}


/*
  ENV values needed:

  API_DATABASE_HOST
  API_DATABASE_USER
  API_DATABASE_PASSWORD
  S3_DBS_TO_BACKUP
  S3_ENDPOINT
  S3_KEY
  S3_SECRET
  S3_MYSQL_BUCKET
 */
module.exports = {
	cronTime: '0 0 1 * * *',
	runOnInit: false,
	onTick: async function() {
    return backupMysqlToS3();
	}
};
