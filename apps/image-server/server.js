require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const app = express();
const imgSteam = require('image-steam');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('./s3');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const mime      = require('mime-types');

const { createFilename, sanitizeFileName, getFileUrl } = require('./utils')
const fs = require('node:fs');
const path = require('path');

console.log ('S3 enabled:', s3.isEnabled());

const swapLastDotUnderscore = (name) => {
  if (!name) return null;
  const match = name.match(/^(.*)([._])([a-z0-9]+)$/i);
  if (!match) return null;
  const sep = match[2] === '.' ? '_' : '.';
  return `${match[1]}${sep}${match[3]}`;
};

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
      key: function(req, file, cb) {
        cb(null, 'images/' + createFilename(file.originalname));
      }
    });
  } catch (error) {
    throw new Error(`S3 Multer storage error: ${error.message}`);
  }
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
      
      // SSRF mitigation: Validate and sanitize image path
      // Only allow filenames with safe characters and common image extensions
      const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'];
      const safeImageNamePattern = /^[a-zA-Z0-9_\-\.]+$/;
      const unsafePath = req.url;

      // Prevent directory traversal or illegal characters
      const baseName = path.basename(unsafePath); // strips directory components
      const extension = baseName.split('.').pop().toLowerCase();
      if (
        baseName !== unsafePath // directory component detected
        || !safeImageNamePattern.test(baseName) // unsafe chars present
        || !ALLOWED_EXTENSIONS.includes(extension) // extension not allowed
      ) {
        return res.status(400).send('Invalid image filename or path');
      }

      const mimeType  = mime.lookup(extension);
      
      const endpoint = process.env.S3_ENDPOINT.replace('https://', `https://${process.env.S3_BUCKET}.`);
      
      const { pipeline, Readable } = require('stream');
      const { promisify } = require('util');
      const pump = promisify(pipeline);
      
      try {
        const s3Url = `${endpoint}/images/${baseName}`;
        let response;
        try {
          response = await fetch(s3Url);
        } catch (err) {
          console.error('Upstream fetch failed', err);
          return res.status(502).send('Upstream fetch failed');
        }
      
        if (!response || !response.ok) {
          const altName = swapLastDotUnderscore(baseName);
          if (altName && altName !== baseName) {
            const altUrl = `${endpoint}/images/${altName}`;
            response = await fetch(altUrl);
          }
        }

        if (!response || !response.ok) {
          return res.status(response ? response.status : 502).send('File not found');
        }
      
        res.setHeader('Content-Type', mimeType);
        const contentLength = response.headers.get('content-length');
        if (contentLength) res.setHeader('Content-Length', contentLength);
      
        const upstream = response.body ? Readable.fromWeb(response.body) : null;
        if (!upstream) {
          console.error('No upstream body available');
          return res.status(500).send('No upstream body');
        }
      
        upstream.on('error', (err) => {
          console.error('Upstream stream error', err);
          if (!res.headersSent) res.status(500).end();
          else res.destroy();
        });
      
        res.on('error', (err) => {
          console.error('Client response error', err);
          upstream.destroy(err);
        });
      
        res.on('close', () => {
          // client disconnected
          upstream.destroy(new Error('Client disconnected'));
        });
      
        try {
          await pump(upstream, res);
        } catch (err) {
          console.error('Pipeline failed', err);
          if (!res.headersSent) res.status(500).send('Stream error');
          else res.destroy();
        }
      } catch (err) {
        console.error('Unexpected error', err);
        if (!res.headersSent) res.status(500).send('Internal server error');
        else res.destroy();
      }
    } else {
      req.url = req.url.replace('/image', '');

      const unsafePath = req.url.replace(/^\//, '');
      const baseName = path.basename(unsafePath);
      if (baseName === unsafePath) {
        const imagesDir = process.env.IMAGES_DIR || 'images/';
        const resolvedPath = path.resolve(imagesDir, baseName);
        if (!fs.existsSync(resolvedPath)) {
          const altName = swapLastDotUnderscore(baseName);
          if (altName) {
            const altPath = path.resolve(imagesDir, altName);
            if (fs.existsSync(altPath)) {
              req.url = `/${altName}`;
            }
          }
        }
      }
  
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
      'image/gif',
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
      
        // remove /document/ from the path
        req.url = req.url.replace(/^\/document\//, '');
      
        // Prevent path traversal attacks in S3 requests
        const sanitizedPath = path.posix.normalize(req.url).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^\/+/, '');
        if (sanitizedPath.includes('..')) {
          return res.status(403).send('Forbidden');
        }
        const extension = sanitizedPath.split('.').pop().toLowerCase();
        // get mime type for extension
        const mimeType  = mime.lookup(extension);
        
        const endpoint = process.env.S3_ENDPOINT.replace('https://', `https://${process.env.S3_BUCKET}.`);
        
        const { pipeline, Readable } = require('stream');
        const { promisify } = require('util');
        const pump = promisify(pipeline);
        
        try {
          const s3Url = `${endpoint}/documents/${sanitizedPath}`;
          let response;
          try {
            response = await fetch(s3Url);
          } catch (err) {
            console.error('Upstream fetch failed', err);
            return res.status(502).send('Upstream fetch failed');
          }
          
          if (!response || !response.ok) {
            const altName = swapLastDotUnderscore(sanitizedPath);
            if (altName && altName !== sanitizedPath) {
              const altUrl = `${endpoint}/documents/${altName}`;
              response = await fetch(altUrl);
            }
          }

          if (!response || !response.ok) {
            return res.status(response ? response.status : 502).send('File not found');
          }
        
          res.setHeader('Content-Type', mimeType || 'application/octet-stream');
          const contentLength = response.headers.get('content-length');
          if (contentLength) res.setHeader('Content-Length', contentLength);
          // Use basename to ensure only filename is used in Content-Disposition
          res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(sanitizedPath) + '"');
        
          const upstream = response.body ? Readable.fromWeb(response.body) : null;
          if (!upstream) {
            console.error('No upstream body available');
            return res.status(500).send('No upstream body');
          }
        
          // Protect against upstream stream errors
          upstream.on('error', (err) => {
            console.error('Upstream stream error', err);
            if (!res.headersSent) return res.status(500).end();
            res.destroy();
          });
        
          // If the client connection errors or closes, destroy the upstream
          res.on('error', (err) => {
            console.error('Client response error', err);
            upstream.destroy(err);
          });
          res.on('close', () => {
            upstream.destroy(new Error('Client disconnected'));
          });
        
          try {
            await pump(upstream, res);
          } catch (err) {
            console.error('Pipeline failed', err);
            if (!res.headersSent) return res.status(500).send('Stream error');
            res.destroy();
          }
        
          return;
        } catch (err) {
          console.error('Unexpected error while streaming from S3', err);
          if (!res.headersSent) return res.status(500).send('Internal server error');
          res.destroy();
        }
      }
      
      const documentsDir = path.resolve('documents/');

      const requestedPath = req.path.replace(/^\/document\//, '');

      let resolvedPath = path.resolve(documentsDir, requestedPath);
      
      if (!resolvedPath.startsWith(documentsDir)) {
          return res.status(403).send('Forbidden');
      }

      if (!fs.existsSync(resolvedPath)) {
        const baseName = path.basename(requestedPath);
        const altName = swapLastDotUnderscore(baseName);
        if (altName) {
          const altResolved = path.resolve(documentsDir, altName);
          if (altResolved.startsWith(documentsDir) && fs.existsSync(altResolved)) {
            resolvedPath = altResolved;
          }
        }
      }

      res.download(resolvedPath);
  });

app.use((req, res, next) => {
  // Check that a token is provided
  if (!req.headers['image-token']) {
    return res.status(401).send('Unauthorized');
  }
  
  const token = req.headers['image-token'];
  const secret = process.env.IMAGE_VERIFICATION_TOKEN;
  
  // Check that the token is correct
  const actual = crypto.createHash('sha256').update(token).digest();
  const expected = crypto.createHash('sha256').update(secret).digest();
  if (!crypto.timingSafeEqual(actual, expected)) {
    return res.status(401).send('Unauthorized');
  }
  
  next();
});

/**
 *  The url for creating one Image
 */
app.post('/image',
  imageUpload.single('image'), (req, res, next) => {
    const url = getFileUrl(req.file, 'image');

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
      const url = getFileUrl(file, 'image');

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
    
    const url = getFileUrl(req.file, 'document');

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
      const url = getFileUrl(file, 'document');
      
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
