const Game = require('../models/Game');
const { OpenAI } = require('openai');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Process AI command for game modification
exports.processAICommand = async (req, res) => {
  try {
    const { gameId, command } = req.body;
    
    const game = await Game.findOne({ _id: gameId, createdBy: req.user.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Convert game data to text for AI
    const gameDataStr = JSON.stringify(game.projectData, null, 2);
    
    const prompt = `
      You are a game development assistant for Kridart game engine.
      Current game data: ${gameDataStr}
      
      User command: ${command}
      
      Respond with ONLY a JSON object containing:
      - modifiedGameData: The modified game data
      - explanation: Brief explanation of changes made
      
      Make the minimal changes needed to fulfill the request.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful game development assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Update game with AI modifications
    game.projectData = result.modifiedGameData;
    await game.save();
    
    res.json({
      game: game,
      explanation: result.explanation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};