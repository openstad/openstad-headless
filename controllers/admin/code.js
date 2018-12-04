const UniqueCode    = require('../../models').UniqueCode;
const multer        = require('multer');
const upload        = multer({});
const csv           = require("fast-csv");

exports.all = (req, res, next) => {
  res.render('admin/code/all', {
    codes: req.codes
  });
}

exports.new = (req, res, next) => {
  res.render('admin/code/new', {
    clients: req.clients
  });
}

exports.bulk = (req, res, next) => {
  res.render('admin/code/bulk', {
    clients: req.clients
  });
}

/*
exports.edit = (req, res, next) => {
  res.render('admin/code/edit', {
    code: req.code
  });
}
*/
exports.postBulk = [upload.single('file'), (req, res, next) => {
  //var stream = fs.createReadStream("my.csv");
  const codes = [];
  const clientId = req.body.clientId;

  const checkIfAllCodesSaved = (codes) => {
    const notProcessed = codes.filter(code => !!code.processed);
    return notProcessed.length === 0;
  }

  /**
   * Finished Uploading
   */
  const finishUpload = (codes) => {
    const duplicates = codes.filter(code => code.duplicate)
    const errors = codes.filter(code => code.error);

    if (duplicates.length > 0 || errors.length > 0) {
      req.flash('error', {msg: `Upload not completely succesfull, duplicates:${duplicates.length} & errors: ${errors.length}` });
    } else {
      req.flash('success', {msg: `All codes succesfully created!` });
    }

    res.redirect(req.header('Referer') || '/admin/code/bulk');
  }

  /**
   * When CSV is read, maybe db is not ready yet,
   * so we check if all codes have processed set to true
   */
  const checkAllCodes = (codes) => {
    if (checkIfAllCodesSaved(codes)) {
      finishUpload(codes);
    } else {
      setTimeout(() => { checkAllCodes(codes); }, 500);
    };
  }

  csv
   .fromStream(stream)
   .on("data", function(data){
     let code = data[0];

     let codeStatus = {
       code: code,
       processed: false,
       duplicate: null,
       error: null
     };

     codes.push(codeStatus);

     /**
      * Fetch uniqueCode
      * if exists, set to duplicate
      * otherwise set
      */
     new UniqueCode({code: code, clientId: clientId })
      .fetch()
      .then((uniqueCode) => {
        // if code exists already, the duplicate
        if (uniqueCode) {
          codeStatus.duplicate = true;
          codeStatus.processed = true;
        } else {
          new UniqueCode({code: code, clientId: clientId})
            .save()
            .then(() => { codeStatus.processed = true; });
        }
      })
      .catch((error) => {
        codeStatus.error = true;
        codeStatus.processed = true;
      })
   })
   .on("end", function(){
      checkAllCodes(codes);
   });

}];

/**
 * @TODO validation in middleware
 */
exports.create = (req, res, next) => {
  const { code, clientId } = req.body;

  console.log('body', req.body);

  new UniqueCode({ code, clientId })
    .save()
    .then((response) => {
      req.flash('success', { msg: 'Succesfully created '});
      res.redirect('/admin/codes' || '/');
    })
    .catch((err) => { next(err); });
}

exports.destroy = (req, res) => {
  req.body.codeModel.destroy();
  req.flash('success', { msg: 'Succesfully removed'});
  res.redirect('/admin/codes');
}
