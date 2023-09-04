const fs = require('fs').promises;

module.exports = async function seed(db) {

  try {

    console.log('  creating development data');

    // console.log('    2 users');
    // await db.User.create({
    //   role: 'member',
    //   name: 'Niels Vegter',
    // });

  } catch(err) {
    console.log(err);
  }
  
}








