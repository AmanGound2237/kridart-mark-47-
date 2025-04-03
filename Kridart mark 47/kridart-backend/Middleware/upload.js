const multer = require('multer');
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|gif|mp3|wav|obj|fbx|glb)$/)) {
      return cb(new Error('Please upload an image, audio, or 3D model file'));
    }
    cb(null, true);
  }
});

module.exports = upload;