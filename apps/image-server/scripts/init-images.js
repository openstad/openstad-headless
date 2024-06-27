require('dotenv').config();
const fs = require('fs').promises;

(async () => {

  try {

    console.log('Init default images...');

    try {

      let files = await fs.readdir(`seeds/lorem-images`);
      let targetDir = `${process.env.PWD}${process.env.IMAGES_DIR || '/images'}`;
      for (let file of files) {
        console.log(`  ${file}`);
        await fs.copyFile( `seeds/lorem-images/${file}`, `${targetDir}/${file}` );
      }

    } catch(err) {
      console.log(err);
    }

  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }

})();
