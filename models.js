// models.js - MongoDB models for the application
const mongoose = require('mongoose');

// Define conversation schema
const conversationSchema = new mongoose.Schema({
  session_id: { type: String, required: true, unique: true },
  started_at: { type: Date, default: Date.now },
  last_message_at: { type: Date, default: Date.now }
});

// Define message schema
const messageSchema = new mongoose.Schema({
  conversation_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Conversation',
    required: true 
  },
  content: { type: String, required: true },
  is_user: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Define appointment schema
const appointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  topic: { type: String, default: 'General Consultation' },
  dateTime: { type: String, required: true, unique: true },
  formattedDate: { type: String, required: true },
  formattedTime: { type: String, required: true },
  cancellationToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Define appointment slot schema
const slotSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true, unique: true },
  formattedDate: { type: String, required: true },
  formattedTime: { type: String, required: true },
  available: { type: Boolean, default: true }
});

// Create and export models
const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Slot = mongoose.model('Slot', slotSchema);

module.exports = {
  Conversation,
  Message,
  Appointment,
  Slot
};