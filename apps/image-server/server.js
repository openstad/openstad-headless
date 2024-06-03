require('dotenv').config();
const express = require('express');
const app = express();
const imgSteam = require('image-steam');
const multer = require('multer');
const crypto = require('crypto')

const secret = process.env.IMAGE_VERIFICATION_TOKEN

const imageMulterConfig = {
  onError: function (err, next) {
    console.error(err);
    next(err);
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/svg+xml'
    ];

    if (allowedTypes.indexOf(file.mimetype) === -1) {
      req.fileValidationError = 'goes wrong on the mimetype';
      return cb(null, false, new Error('goes wrong on the mimetype'));
    }

    cb(null, true);
  }
}

const sanitizeFileName = (fileName) => {
  let sanitizedFileName = fileName.replace(/[^a-z0-9_\-]/gi, '_');
  return sanitizedFileName.replace(/_+/g, '_');
}

const createFilename = (originalFileName) => {
  const fileExtension = originalFileName.split('.').pop();
  const fileNameWithoutExtension = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName
  const sanitizedFileName = sanitizeFileName(fileNameWithoutExtension);

  const randomUUID = crypto.randomUUID();

  return `${sanitizedFileName}-${randomUUID}.${fileExtension}`;
}

const imageSteamConfig = {
  "storage": {
    "defaults": {
      "driver": "fs",
      "path": "./images",
      "cacheTTS": process.env.CACHE_TTS || 86400 * 14, /* 24 * 14 hrs */
      "cacheOptimizedTTS": process.env.CACHE_OPTIMIZED_TTS || 86400 * 14, /*  24 * 14 hrs */
      "cacheArtifacts": process.env.CACHE_ARTIFACTS || true
    },
  },
  "throttle": {
    "ccProcessors": process.env.THROTTLE_CC_PROCESSORS || 4,
    "ccPrefetchers": process.env.THROTTLE_CC_PREFETCHER || 20,
    "ccRequests": process.env.THROTTLE_CC_REQUESTS || 100
  },
  log: {
    errors: true
  },
  router: {
    originalSteps: {
      metadata: {
        enabled: 'false',
      },
    },
    hqOriginalSteps: {
      metadata: {
        enabled: 'false',
      },
    },
  },
};

imageMulterConfig.dest = process.env.IMAGES_DIR || 'images/';

const imageUpload = multer(imageMulterConfig);

const argv = require('yargs')
  .usage('Usage: $0 [options] pathToImage')
  .demand(0)
  .options({
    'port': {
      alias: 'p',
      describe: 'Port number the service will listen to',
      type: 'number',
      group: 'Image service',
      default: process.env.PORT_API || 9999
    },
    'portImageSteam': {
      alias: 'pis',
      describe: 'Port number the Image server will listen to',
      type: 'number',
      group: 'Image service',
      default: process.env.PORT_IMAGE_SERVER || 13337
    },
  })
  .help()
  .argv;

/**
 * Instantiate the Image steam server, and proxy it with
 */
const ImageServer = new imgSteam.http.Connect(imageSteamConfig);
const imageHandler = ImageServer.getHandler();

/**
 * Most errors is not found
 * @TODO: requires debugging if other errors are handled by server
 */
ImageServer.on('error', (err) => {
  // Don't log 404 errors, so we do nothing here.
});

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*' )
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, x-http-method-override');
  res.header('Access-Control-Allow-Credentials', 'true');
  next()
})

app.get('/image/*',
  function (req, res, next) {
    req.url = req.url.replace('/image', '');

    /**
     * Pass request en response to the imageserver
     */
    imageHandler(req, res);
  });


/**
 *  The url for creating one Image
 */
app.post('/image',
  imageUpload.single('image'), (req, res, next) => {
    // req.file is the `image` file
    // req.body will hold the text fields, if there were any
    //
    const createdCombination = secret + req.query.exp_date
    const verification = crypto.createHmac("sha256", createdCombination).digest("hex")
    if(Date.now() < req.query.exp_date && verification === req.query.signature) {
      console.log("This post has been successfully verified!")
    }

    const fileName = req.file.filename || req.file.key;
    let url = `${process.env.APP_URL}/image/${fileName}`;

    let protocol = '';

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
    }

    res.send(JSON.stringify({
      name: req.file.name,
      url: protocol + url
    }));
  });

app.post('/images',
  imageUpload.array('image', 30), (req, res, next) => {
        // req.files is array of `images` files
        // req.body will contain the text fields, if there were any
        const createdCombination = secret + req.query.exp_date
        const verification = crypto.createHmac("sha256", createdCombination).digest("hex")
        if(Date.now() < req.query.exp_date && verification === req.query.signature) {
            console.log("This post has been successfully verified!")
        }

        res.send(JSON.stringify(req.files.map((file) => {
            let url = `${process.env.APP_URL}/image/${file.filename}`;

            let protocol = '';

            if (!url.startsWith('http://') && !url.startsWith('https://')) {
              protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
            }

            return {
                name: file.originalname,
                url: protocol + url
            }
        })));
    });



const documentMulterConfig = {
  onError: function (err, next) {
    console.error(err);
    next(err);
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (allowedTypes.indexOf(file.mimetype) === -1) {
      req.fileValidationError = 'goes wrong on the mimetype';
      return cb(null, false, new Error('goes wrong on the mimetype'));
    }

    const forbiddenChars = /[\\/:]/;
    if (forbiddenChars.test(file.originalname)) {
      req.fileValidationError = 'Forbidden characters in filename';
      return cb(null, false, new Error('Forbidden characters in filename'));
    }

    cb(null, true);
  },
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, process.env.DOCUMENTS_DIR || 'documents/');
    },
    filename: function (req, file, cb) {

      const uniqueFileName = createFilename(file.originalname)

      cb(null, uniqueFileName);
    }
  })
}

documentMulterConfig.dest = process.env.DOCUMENTS_DIR || 'documents/';
const documentUpload = multer(documentMulterConfig);

app.get('/document/*',
  function (req, res, next) {
    req.url = req.url.replace('/document', '');

    /**
     * Pass request en response to the imageserver
     */
    // return res.download(`${process.env.APP_URL}/document/${req.url}`);
    return res.download(`documents/${req.url}`);
  });

const allowedExtensions = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx'
];

/**
 *  The url for creating one Document
 */
app.post('/document',
  documentUpload.single('document'), (req, res, next) => {
  console.log( 'req.file', req.file );
    const createdCombination = secret + req.query.exp_date;
    const verification = crypto.createHmac("sha256", createdCombination).digest("hex");
    if (Date.now() < req.query.exp_date && verification === req.query.signature) {
      console.log("This post has been successfully verified!")
    }

    const fileExtension = req.file.originalname.split('.').pop();

    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid file extension' });
    }

    const fileName = createFilename(req.file.originalname);

    let url = `${process.env.APP_URL}/document/${encodeURIComponent(fileName)}`;

    let protocol = '';

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
    }

    res.send(JSON.stringify({
      name: req.file.originalname,
      url: protocol + url
    }));
  });

app.post('/documents',
  documentUpload.array('document', 30), (req, res, next) => {
    const createdCombination = secret + req.query.exp_date;
    const verification = crypto.createHmac("sha256", createdCombination).digest("hex");
    if (Date.now() < req.query.exp_date && verification === req.query.signature) {
      console.log("This post has been successfully verified!")
    }

    const invalidFiles = req.files.filter(file => {
      const fileExtension = file.originalname.split('.').pop();
      return !allowedExtensions.includes(fileExtension.toLowerCase());
    });

    if (invalidFiles.length > 0) {
      return res.status(400).json({ error: 'Invalid file extension' });
    }

    res.send(JSON.stringify(req.files.map((file) => {
      let url = `${process.env.APP_URL}/document/${encodeURIComponent(file.filename)}`;

      let protocol = '';

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
      }

      return {
        name: file.originalname,
        url: protocol + url
      }
    })));
  });


app.use(function (err, req, res, next) {
  const status = err.status ? err.status : 500;
  console.error(err);
  // if (!res.headerSent) {
  //   res.setHeader('Content-Type', 'application/json');
  // }

  res.status(status).send(JSON.stringify({
    error: err.message
  }));
})

app.listen(argv.port, function () {
  console.log('Application listen on port %d...', argv.port);
});
