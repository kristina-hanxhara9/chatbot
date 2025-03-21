// db.js - Improved database connection with proper timeout handling
const mongoose = require('mongoose');
const { Conversation, Message } = require('./models');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/transform-ai';

// Connect to MongoDB with explicit options to handle timeouts
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increased timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
      connectTimeoutMS: 30000, // Connection timeout
    });
    
    console.log('Connected to MongoDB successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return null;
  }
}

// Get or create a conversation by session ID
async function getOrCreateConversation(sessionId) {
  try {
    let conversation = await Conversation.findOne({ session_id: sessionId });
    
    if (!conversation) {
      conversation = new Conversation({
        session_id: sessionId,
        started_at: new Date(),
        last_message_at: new Date()
      });
      await conversation.save();
    } else {
      // Update last message timestamp
      conversation.last_message_at = new Date();
      await conversation.save();
    }
    
    return conversation;
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    throw error;
  }
}

// Save a message to a conversation
async function saveMessage(conversationId, content, isUser) {
  try {
    const message = new Message({
      conversation_id: conversationId,
      content,
      is_user: isUser,
      timestamp: new Date()
    });
    
    await message.save();
    return message;
  } catch (error) {
    console.error('Error in saveMessage:', error);
    throw error;
  }
}

// Get all messages for a conversation
async function getConversationMessages(conversationId) {
  try {
    return await Message.find({ conversation_id: conversationId })
      .sort({ timestamp: 1 });
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
}

module.exports = {
  connectToDatabase,
  getOrCreateConversation,
  saveMessage,
  getConversationMessages
};