const Game = require('../models/Game');

// Create new game project
exports.createGame = async (req, res) => {
  try {
    const { title, description, projectData } = req.body;
    
    const game = new Game({
      title,
      description,
      projectData: JSON.parse(projectData),
      createdBy: req.user.id
    });

    await game.save();
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update game project
exports.updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, projectData } = req.body;
    
    const game = await Game.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      { 
        title,
        description,
        projectData: JSON.parse(projectData),
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Publish game
exports.publishGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    const game = await Game.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      { 
        isPublished: true,
        publishedAt: Date.now()
      },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's games
exports.getUserGames = async (req, res) => {
  try {
    const games = await Game.find({ createdBy: req.user.id });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
