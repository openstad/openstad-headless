require('dotenv').config();
const db = require('./db');
const { Umzug, SequelizeStorage } = require('umzug');

const umzug = new Umzug({
  migrations: { glob: './migrations/*.js' },
  context: db.sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: db.sequelize }),
  logger: console,
});

(async () => {
  let migrations = await umzug.up();
  if( !migrations.length ) {
		console.log('No new migrations');
	} else {
		console.log('Executed migrations:');
		var fileNames = migrations.map(m => m.file);
		console.log(fileNames.join('\n'));
	}
  process.exit();
})();
