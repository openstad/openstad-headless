require('dotenv').config();
const db = require('../src/db');
const { Umzug, SequelizeStorage } = require('umzug');

const umzug = new Umzug({
  migrations: {
    glob: './migrations/*.js',
    params: [
            db.sequelize.getQueryInterface(),
            db.Sequelize // Sequelize constructor - the required module
        ],
     },
  context: db.sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: db.sequelize, tableName : 'migrations' }),
  logger: console,
});

(async () => {
  const args = process.argv.slice(2);
  if (args.find(arg => arg == 'down')) {
    let step = args.find(arg => arg.match('step='));
    if (step) step = parseInt( step.replace(/^step=(\d+)$/, '$1') );
    let migrations = await umzug.down({ step: step || 1 });
    if( !migrations.length ) {
		  console.log('No migrations found');
	  }
  } else {
    let migrations = await umzug.up();
    if( !migrations.length ) {
		  console.log('No new migrations');
	  }
  }
  process.exit();
})();
