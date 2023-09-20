const fs = require('fs').promises;

module.exports = async function seed(db) {

  // copy example images - TODO: s3
  let imageDir = './images';
  let files = await fs.readdir('./seeds/lorem-images');
  console.log('  copy seed images to', imageDir);
  for (let file of files) {
    try {
      await fs.copyFile(`./seeds/lorem-images/${file}`, `${imageDir}/${file}`)
      console.log(`    ${file}`);
    } catch(err) {
      console.log(err);
    }
    
  }


  

}
