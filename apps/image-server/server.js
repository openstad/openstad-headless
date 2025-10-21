require('dotenv').config();
const express = require('express');
const app = express();
const imgSteam = require('image-steam');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('./s3');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const mime      = require('mime-types');

const { createFilename, sanitizeFileName } = require('./utils')
const fs = require('node:fs');

console.log ('S3 enabled:', s3.isEnabled());

const imageMulterConfig = {
  onError: function (err, next) {
    console.error(err);
    next(err);
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype && !file.mimetype.startsWith('image/')) {
      req.fileValidationError = 'goes wrong on the mimetype';
      return cb(null, false, new Error('goes wrong on the mimetype'));
    }

    cb(null, true);
  }
}

if (s3.isEnabled()) {
  try {
    imageMulterConfig.storage = multerS3({
      s3: s3.getClient(),
      bucket: process.env.S3_BUCKET,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {
          fieldName: file.fieldname,
        });
      },
      destination: function (req, file, cb) {
        cb(null, 'images/');
      },
      key: function (req, file, cb) {
        cb(null, 'images/' + createFilename(file.originalname));
      },
    });
  } catch (error) {
    throw new Error(`S3 Multer storage error: ${error.message}`);
  }
} else {
  imageMulterConfig.storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, process.env.IMAGES_DIR || 'images/');
    },
    filename: function (req, file, cb) {
      const uniqueFileName = createFilename(file.originalname)

      cb(null, uniqueFileName);
    }
  });
}

const disableWebpSupport = process.env.DISABLE_WEBP_CONVERSION === 'true';

const imageSteamConfig = {
  "storage": {
    "defaults": {
      "driver": "fs",
      "path": process.env.IMAGES_DIR || "images/",
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
    supportWebP: !disableWebpSupport,
    hqOriginalMaxPixels: process.env.HQ_ORIGINAL_MAX_PIXELS || 160000,  // default value of image-steam is 400 * 400 = 160000 px
  },
};

if (s3.isEnabled()) {
  imageSteamConfig.storage.defaults = {
    driverPath: 'image-steam-s3',
    endpoint: process.env.S3_ENDPOINT,
    bucket: process.env.S3_BUCKET,
    accessKey: process.env.S3_KEY,
    secretKey: process.env.S3_SECRET,
  };
}

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
  console.log ('ImageServer error:', err);
  // Don't log 404 errors, so we do nothing here.
});

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*' )
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, x-http-method-override');
  next()
})

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/image/*',
  rateLimiter(),
  async function (req, res, next) {
    if (s3.isEnabled()) {
      // remove /image/ from the path
      req.url = req.url.replace(/^\/image\//, '');
      
      const extension = req.url.split('.').pop().toLowerCase();
      // get mime type for extension
      const mimeType  = mime.lookup(extension);
      
      const endpoint = process.env.S3_ENDPOINT.replace('https://', `https://${process.env.S3_BUCKET}.`);
      
      // build s3 url
      const s3Url = `${endpoint}/images/${req.url}`;
      const response = await fetch(s3Url);
      
      if (!response.ok) {
        return res.status(response.status).send('File not found');
      }
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', response.headers.get('content-length'));
      
      
      // Pipe the S3 response to the client
      const { Readable } = require("stream");
      console.log('response', response.body)
      Readable.fromWeb(response.body).pipe(res);
    } else {
      req.url = req.url.replace('/image', '');
  
      /**
       * Pass request en response to the imageserver
       */
      imageHandler(req, res);
    }
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

    if (file.mimetype && allowedTypes.indexOf(file.mimetype) === -1 && !file.mimetype.startsWith('image/')) {
      req.fileValidationError = 'goes wrong on the mimetype';
      return cb(null, false, new Error('goes wrong on the mimetype'));
    }

    const forbiddenChars = /[\\/:]/;
    if (forbiddenChars.test(file.originalname)) {
      req.fileValidationError = 'Forbidden characters in filename';
      return cb(null, false, new Error('Forbidden characters in filename'));
    }

    cb(null, true);
  }
}

if (s3.isEnabled()) {
  try {
    documentMulterConfig.storage = multerS3({
      s3: s3.getClient(),
      bucket: process.env.S3_BUCKET,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {
          fieldName: file.fieldname,
        });
      },
      destination: function (req, file, cb) {
        cb(null, 'documents/');
      },
      key: function (req, file, cb) {
        cb(null, 'documents/' + createFilename(file.originalname));
      },
    });
  } catch (error) {
    throw new Error(`S3 Multer storage error: ${error.message}`);
  }
} else {
  documentMulterConfig.storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, process.env.DOCUMENTS_DIR || 'documents/');
    },
    filename: function (req, file, cb) {
      const uniqueFileName = createFilename(file.originalname)

      cb(null, uniqueFileName);
    }
  });
}

documentMulterConfig.dest = process.env.DOCUMENTS_DIR || 'documents/';
const documentUpload = multer(documentMulterConfig);

function handleFileResponse(filePath, readStream, res) {
  // Content-type is very interesting part that guarantee that
  // Web browser will handle response in an appropriate manner.

  // Get filename
  const filename = filePath.substring(filePath.lastIndexOf('/') + 1);
  const mimeType = mime.lookup(filename);

  res.writeHead(200, {
    'Content-Type': mimeType,
    'Content-Disposition': 'attachment; filename=' + filename,
  });

  readStream.pipe(res);
}

app.get('/document/*',
  rateLimiter(),
  async function (req, res, next) {
      
      if (s3.isEnabled()) {
      
        // remove /image/ from the path
        req.url = req.url.replace(/^\/document\//, '');
      
        const extension = req.url.split('.').pop().toLowerCase();
        // get mime type for extension
        const mimeType  = mime.lookup(extension);
        
        const endpoint = process.env.S3_ENDPOINT.replace('https://', `https://${process.env.S3_BUCKET}.`);
        
        // build s3 url
        const s3Url = `${endpoint}/documents/${req.url}`;
        const response = await fetch(s3Url);
        
        if (!response.ok) {
          return res.status(response.status).send('File not found');
        }
        
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', response.headers.get('content-length'));
        res.setHeader('Content-Disposition', 'attachment; filename=' + req.url);
        
        
        // Pipe the S3 response to the client
        const { Readable } = require("stream");
        Readable.fromWeb(response.body).pipe(res);
        return;
      }
      
      const path = require('path');
      const documentsDir = path.resolve('documents/');

      const requestedPath = req.path.replace(/^\/documents\//, '');

      const resolvedPath = path.resolve(documentsDir, requestedPath);
      
      // Check if file specified by the resolvedPath exists
      fs.exists(resolvedPath, function (exists) {
        if (exists) {
          const readStream = fs.createReadStream(resolvedPath);
          handleFileResponse(resolvedPath, readStream, res);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('ERROR File does not exist');
        }
      });

  });

app.use((req, res, next) => {
  // Check that a token is provided
  if (!req.headers['image-token']) {
    return res.status(401).send('Unauthorized');
  }
  
  const token = req.headers['image-token'];
  const secret = process.env.IMAGE_VERIFICATION_TOKEN;
  
  // Check that the token is correct
  if (token !== secret) {
    return res.status(401).send('Unauthorized');
  }
  
  next();
});

/**
 *  The url for creating one Image
 */
app.post('/image',
  imageUpload.single('image'), (req, res, next) => {
    let fileName = req.file.key;
    fileName = fileName.replace(/^images\//, '');
    let url = `${process.env.APP_URL}/image/${fileName}`;

    let protocol = '';

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
    }

    res.send(JSON.stringify({
      name: sanitizeFileName(req.file.originalname),
      url: protocol + url
    }));
  });

app.post('/images',
  imageUpload.array('image', 30), (req, res, next) => {
    res.send(JSON.stringify(req.files.map((file) => {
      let fileName = file.key || file.filename;
        fileName = fileName.replace(/^images\//, '');
        let url = `${process.env.APP_URL}/image/${fileName}`;

        let protocol = '';

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
        }

        return {
            name: sanitizeFileName(file.originalname),
            url: protocol + url
        }
    })));
});

/**
 *  The url for creating one Document
 */
app.post('/document',
  documentUpload.single('document'), (req, res, next) => {
    const fileName = req?.file?.filename || '';

    // Check if the filename is not empty
    if (!fileName) {
      return res.status(400).send(JSON.stringify({ error: 'No file uploaded' }));
    }

    let url = `${process.env.APP_URL}/document/${encodeURIComponent(fileName)}`;

    let protocol = '';

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
    }

    res.send(JSON.stringify({
      name: sanitizeFileName(req.file.originalname),
      url: protocol + url
    }));
  });

app.post('/documents',
  documentUpload.array('document', 30), (req, res, next) => {
    res.send(JSON.stringify(req.files.map((file) => {
       let fileName = file.key || file.filename;
        fileName = fileName.replace(/^documents\//, '');
      let url = `${process.env.APP_URL}/document/${fileName}`;
      
      let protocol = '';

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
      }

      return {
        name: sanitizeFileName(file.originalname),
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
