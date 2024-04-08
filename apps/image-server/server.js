require('dotenv').config();
const express = require('express');
const app = express();
const imgSteam = require('image-steam');
const multer = require('multer');
const crypto = require('crypto')

const secret = process.env.IMAGE_VERIFICATION_TOKEN

const multerConfig = {
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

multerConfig.dest = process.env.IMAGES_DIR || 'images/';

const upload = multer(multerConfig);

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
  upload.single('image'), (req, res, next) => {
    // req.file is the `image` file
    // req.body will hold the text fields, if there were any
    //
    const createdCombination = secret + req.query.exp_date
    const verification = crypto.createHmac("sha256", createdCombination).digest("hex")
    if(Date.now() < req.query.exp_date && verification === req.query.signature) {
      console.log("This post has been successfully verified!")
    }

    const fileName = req.file.filename || req.file.key;
    res.send(JSON.stringify({
      url: process.env.APP_URL + '/image/' + fileName
    }));
  });

app.post('/images',
    upload.array('image', 30), (req, res, next) => {
        // req.files is array of `images` files
        // req.body will contain the text fields, if there were any
        const createdCombination = secret + req.query.exp_date
        const verification = crypto.createHmac("sha256", createdCombination).digest("hex")
        if(Date.now() < req.query.exp_date && verification === req.query.signature) {
            console.log("This post has been successfully verified!")
        }

        res.send(JSON.stringify(req.files.map((file) => {
            return {
                url: process.env.APP_URL + '/image/' + file.filename
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
