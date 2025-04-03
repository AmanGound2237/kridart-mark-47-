
const Asset = require('../models/Asset');
const bucket = require('../config/storage');
const { v4: uuidv4 } = require('uuid');

// Upload asset file to storage
const uploadAsset = async (file, userId) => {
  const filename = `assets/${uuidv4()}-${file.originalname}`;
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
};

// Create new asset
exports.createAsset = async (req, res) => {
  try {
    const { name, type, category, isPublic } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const url = await uploadAsset(file, req.user.id);
    
    const asset = new Asset({
      name,
      type,
      category,
      url,
      createdBy: req.user.id,
      isPublic
    });

    await asset.save();
    res.status(201).json(asset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get assets by category
exports.getAssets = async (req, res) => {
  try {
    const { category, type } = req.query;
    const filter = { 
      $or: [
        { isPublic: true },
        { createdBy: req.user.id }
      ]
    };
    
    if (category) filter.category = category;
    if (type) filter.type = type;

    const assets = await Asset.find(filter);
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};