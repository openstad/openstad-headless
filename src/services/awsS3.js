const AwsS3 = require('aws-sdk');
const fs     = require('fs');

const getClient = () => {
  const spacesEndpoint = new AwsS3.Endpoint(process.env.S3_ENDPOINT);
  
  const s3Config = {
    endpoint:        spacesEndpoint,
    accessKeyId:     process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET
  }
  
  if (process.env.S3_FORCE_PATH_STYLE) {
    s3Config.s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE;
  }
  
  return new AwsS3.S3(s3Config);
}

const uploadFile = async (localFile, fileNameInS3) => {
  
  let uploadId;
  const s3Client = getClient();
  
  try {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key:    fileNameInS3,
      ACL:    "private"
    };
    const result = await s3Client.createMultipartUpload(params).promise();
    uploadId     = result.UploadId;
    console.info(`${fileNameInS3} multipart created with upload id: ${uploadId}`);
  } catch (e) {
    throw new Error(`Error creating S3 multipart. ${e.message}`);
  }
  
  const chunkSize  = 10 * 1024 * 1024; // 10MB
  const readStream = fs.createReadStream(localFile);
  
  // read the file to upload using streams and upload part by part to S3
  const uploadPartsPromise = new Promise((resolve, reject) => {
    const multipartMap = {Parts: []};
    
    let partNumber       = 1;
    let chunkAccumulator = null;
    
    readStream.on('error', (err) => {
      reject(err);
    });
    
    readStream.on('data', (chunk) => {
      // it reads in chunks of 64KB. We accumulate them up to 10MB and then we send to S3
      if (chunkAccumulator === null) {
        chunkAccumulator = chunk;
      } else {
        chunkAccumulator = Buffer.concat([chunkAccumulator, chunk]);
      }
      if (chunkAccumulator.length > chunkSize) {
        // pause the stream to upload this chunk to S3
        readStream.pause();
        
        s3Client.uploadPart(createUploadPartParams(fileNameInS3, partNumber, uploadId, chunkAccumulator)).promise()
          .then((result) => {
            console.info(`Data uploaded. Entity tag: ${result.ETag} Part: ${partNumber} Size: ${chunkAccumulator.length}`);
            multipartMap.Parts.push({ETag: result.ETag, PartNumber: partNumber});
            partNumber++;
            chunkAccumulator = null;
            // resume to read the next chunk
            readStream.resume();
          }).catch((err) => {
          console.error(`error uploading the chunk to S3 ${err.message}`);
          reject(err);
        });
      }
    });
    
    readStream.on('close', () => {
      if (chunkAccumulator) {
        // upload the last chunk
        s3Client.uploadPart(createUploadPartParams(fileNameInS3, partNumber, uploadId, chunkAccumulator)).promise()
          .then((result) => {
            console.info(`Last Data uploaded. Entity tag: ${result.ETag} Part: ${partNumber} Size: ${chunkAccumulator.length}`);
            multipartMap.Parts.push({ETag: result.ETag, PartNumber: partNumber});
            chunkAccumulator = null;
            resolve(multipartMap);
          }).catch((err) => {
          console.error(`error uploading the last chunk to S3 ${err.message}`);
          reject(err);
        });
      }
    });
  });
  
  const completedMultipartMap = await uploadPartsPromise;
  
  console.info(`All parts uploaded, completing multipart upload, parts: ${completedMultipartMap.Parts.length} `);
  
  // gather all parts' tags and complete the upload
  try {
    const params = {
      Bucket:          process.env.S3_BUCKET,
      Key:             fileNameInS3,
      MultipartUpload: completedMultipartMap,
      UploadId:        uploadId,
    };
    const result = await s3Client.completeMultipartUpload(params).promise();
    console.info(`Upload multipart completed. Location: ${result.Location} Entity tag: ${result.ETag}`);
    return result;
  } catch (e) {
    throw new Error(`Error completing S3 multipart. ${e.message}`);
  }
}

function createUploadPartParams(fileNameInS3, partNumber, uploadId, chunkAccumulator) {
  return {
    Bucket:        process.env.S3_BUCKET,
    Key:           fileNameInS3,
    PartNumber:    partNumber,
    UploadId:      uploadId,
    Body:          chunkAccumulator,
    ContentLength: chunkAccumulator.length,
  };
}


module.exports = {getClient, uploadFile};
