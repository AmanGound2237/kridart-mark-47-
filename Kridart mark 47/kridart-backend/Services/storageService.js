const bucket = require('../config/storage');
const { v4: uuidv4 } = require('uuid');

class StorageService {
  async uploadFile(file, pathPrefix = '') {
    const filename = `${pathPrefix}${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(filename);
    
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', async () => {
        await fileUpload.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        resolve(publicUrl);
      });
      stream.end(file.buffer);
    });
  }

  async deleteFile(url) {
    // Implementation for file deletion
  }
}

module.exports = StorageService;