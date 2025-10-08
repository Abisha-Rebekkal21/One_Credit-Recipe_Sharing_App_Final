import express from 'express';
import Chat from '../models/Chat.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user's chat history
// @route   GET /api/chat/history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user.id })
      .populate('user', 'username profilePicture');
    
    if (!chat) {
      // Return empty array if no chat history exists
      return res.json([]);
    }
    
    res.json(chat.messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ 
      message: 'Error fetching chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Save chat messages
// @route   POST /api/chat/save
// @access  Private
router.post('/save', auth, async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages must be an array' });
    }
    
    // Validate each message structure
    for (const message of messages) {
      if (!message.text || !message.sender) {
        return res.status(400).json({ 
          message: 'Each message must have text and sender fields' 
        });
      }
      if (!['user', 'bot'].includes(message.sender)) {
        return res.status(400).json({ 
          message: 'Sender must be either "user" or "bot"' 
        });
      }
    }
    
    let chat = await Chat.findOne({ user: req.user.id });
    
    if (chat) {
      // Update existing chat
      chat.messages = messages;
    } else {
      // Create new chat
      chat = new Chat({
        user: req.user.id,
        messages: messages
      });
    }
    
    await chat.save();
    
    res.json({ 
      message: 'Chat history saved successfully',
      messagesCount: messages.length
    });
  } catch (error) {
    console.error('Error saving chat history:', error);
    res.status(500).json({ 
      message: 'Error saving chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Clear chat history
// @route   DELETE /api/chat/clear
// @access  Private
router.delete('/clear', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user.id });
    
    if (chat) {
      chat.messages = [];
      await chat.save();
    }
    
    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ 
      message: 'Error clearing chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get chat summary (for admin dashboard)
// @route   GET /api/chat/summary
// @access  Private (Admin only)
router.get('/summary', auth, async (req, res) => {
  try {
    // Check if user is admin (you'll need to implement this check based on your auth system)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const totalChats = await Chat.countDocuments();
    const activeChats = await Chat.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });
    
    const recentChats = await Chat.find()
      .populate('user', 'username email')
      .sort({ lastActive: -1 })
      .limit(10)
      .select('user messages lastActive');
    
    res.json({
      totalChats,
      activeChats,
      recentChats: recentChats.map(chat => ({
        username: chat.user.username,
        messageCount: chat.messages.length,
        lastActive: chat.lastActive
      }))
    });
  } catch (error) {
    console.error('Error fetching chat summary:', error);
    res.status(500).json({ 
      message: 'Error fetching chat summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;