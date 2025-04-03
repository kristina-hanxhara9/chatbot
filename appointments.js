// appointments.js - Appointment scheduler with MongoDB storage and email notifications
const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
const EmailService = require('./email-service'); // New email service

// Telegram configuration - properly rely on environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Check if required environment variables are available
if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.warn('Warning: TELEGRAM_BOT_TOKEN and/or TELEGRAM_CHAT_ID environment variables are not set. Telegram notifications will be disabled.');
}

// Base URL for links in emails
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// Define MongoDB schemas
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

const slotSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true, unique: true },
  formattedDate: { type: String, required: true },
  formattedTime: { type: String, required: true },
  available: { type: Boolean, default: true }
});

// Create MongoDB models (if they don't exist)
let Appointment;
let Slot;
try {
  Appointment = mongoose.model('Appointment');
} catch (error) {
  Appointment = mongoose.model('Appointment', appointmentSchema);
}

try {
  Slot = mongoose.model('Slot');
} catch (error) {
  Slot = mongoose.model('Slot', slotSchema);
}

// Send Telegram notification
async function sendTelegramNotification(message) {
  // Skip notification if Telegram credentials are not set
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram notification skipped: Missing bot token or chat ID');
    return null;
  }
  
  try {
    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    
    if (!response.data.ok) {
      console.error('Telegram API error:', response.data);
    }
    return response.data;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return null;
  }
}

// Generate appointment slots for the next 12 months
function generateDefaultSlots() {
  const slots = [];
  const now = new Date();
  
  // Generate slots for the next 12 months (365 days)
  for (let day = 0; day < 365; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Generate slots from 9 AM to 5 PM with 30-minute intervals
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        date.setHours(hour, minute, 0, 0);
        
        // Skip times that are in the past
        if (date > now) {
          slots.push({
            id: `${date.toISOString()}`,
            date: date.toISOString(),
            formattedDate: date.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric', 
              year: 'numeric'
            }),
            formattedTime: date.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            available: true
          });
        }
      }
    }
  }
  
  return slots;
}

// Get available appointment slots
// Optional modification to getAvailableSlots() for month-by-month loading
async function getAvailableSlots(startDate, endDate) {
  try {
    // Default to showing slots for the next month if no date range specified
    if (!startDate) {
      startDate = new Date();
    }
    
    if (!endDate) {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1); // Show a month of slots
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Convert to ISO strings for comparison
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();
    
    // Get slots for the specified date range
    let slots = await Slot.find({
      date: { $gte: startIso, $lte: endIso }
    });
    
    // If no slots found, generate new ones
    if (slots.length === 0) {
      console.log('No slots found, generating new slots...');
      await refreshAvailableSlots();
      slots = await Slot.find({
        date: { $gte: startIso, $lte: endIso }
      });
    }
    
    // Get all appointments
    const appointments = await Appointment.find({
      dateTime: { $gte: startIso, $lte: endIso }
    });
    
    // Filter out slots that are already booked
    const bookedTimes = new Set(appointments.map(app => app.dateTime));
    const availableSlots = slots.filter(slot => {
      return !bookedTimes.has(slot.date) && new Date(slot.date) > new Date();
    });
    
    console.log(`Found ${availableSlots.length} available slots`);
    return availableSlots;
  } catch (error) {
    console.error('Error getting available slots:', error);
    return [];
  }
}
// Generate a secure token for appointment cancellation
function generateCancellationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Book an appointment
async function bookAppointment(slotId, name, email, topic) {
  try {
    // Find the slot
    const slot = await Slot.findOne({ id: slotId });
    if (!slot) {
      throw new Error('Slot not found');
    }
    
    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({ dateTime: slot.date });
    if (existingAppointment) {
      throw new Error('Slot already booked');
    }
    
    // Generate cancellation token
    const cancellationToken = generateCancellationToken();
    
    // Create new appointment
    const appointment = new Appointment({
      id: `appointment-${Date.now()}`,
      name,
      email,
      topic,
      dateTime: slot.date,
      formattedDate: slot.formattedDate,
      formattedTime: slot.formattedTime,
      cancellationToken,
      createdAt: new Date()
    });
    
    // Save to database
    await appointment.save();
    
    // Send confirmation email
    try {
      await EmailService.sendConfirmationEmail(appointment);
      console.log(`Confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      
      // Send admin notification about email failure
      try {
        await EmailService.sendAdminNotification('CONFIRMATION_EMAIL_FAILED', {
          appointmentId: appointment.id,
          email: appointment.email,
          error: emailError.message
        });
      } catch (adminNotifError) {
        console.error('Failed to send admin notification:', adminNotifError);
      }
    }
    
    // Send Telegram notification
    const notificationMessage = `
<b>🔔 New Appointment Booked!</b>

<b>Client:</b> ${name}
<b>Email:</b> ${email}
<b>Date:</b> ${slot.formattedDate}
<b>Time:</b> ${slot.formattedTime}
<b>Topic:</b> ${topic || 'Not specified'}

Appointment created at: ${new Date().toLocaleString()}
`;

    try {
      await sendTelegramNotification(notificationMessage);
    } catch (error) {
      console.error('Failed to send booking notification:', error);
    }
    
    return appointment;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
}

// Verify appointment token
async function verifyAppointment(appointmentId, token) {
  try {
    const appointment = await Appointment.findOne({ id: appointmentId });
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    if (appointment.cancellationToken !== token) {
      throw new Error('Invalid token');
    }
    
    return appointment;
  } catch (error) {
    console.error('Error verifying appointment:', error);
    throw error;
  }
}

// Cancel appointment by ID and token
async function cancelAppointmentByToken(appointmentId, token) {
  try {
    // Verify token first
    const appointment = await verifyAppointment(appointmentId, token);
    
    // If we get here, the token is valid, so proceed with cancellation
    await Appointment.deleteOne({ id: appointmentId });
    
    // Send cancellation email
    try {
      await EmailService.sendCancellationEmail(appointment);
      console.log(`Cancellation email sent to ${appointment.email}`);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      
      // Send admin notification about email failure
      try {
        await EmailService.sendAdminNotification('CANCELLATION_EMAIL_FAILED', {
          appointmentId: appointment.id,
          email: appointment.email,
          error: emailError.message
        });
      } catch (adminNotifError) {
        console.error('Failed to send admin notification:', adminNotifError);
      }
    }
    
    // Send Telegram notification
    const cancelMessage = `
<b>❌ Appointment Cancelled</b>

<b>Client:</b> ${appointment.name}
<b>Date:</b> ${appointment.formattedDate}
<b>Time:</b> ${appointment.formattedTime}

Cancelled at: ${new Date().toLocaleString()}
`;

    try {
      await sendTelegramNotification(cancelMessage);
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
    }
    
    return appointment;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
}

// Get all appointments
async function getAllAppointments() {
  try {
    return await Appointment.find().sort({ dateTime: 1 });
  } catch (error) {
    console.error('Error getting all appointments:', error);
    return [];
  }
}

// Cancel an appointment (admin function)
async function cancelAppointment(appointmentId) {
  try {
    const appointment = await Appointment.findOne({ id: appointmentId });
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    // Remove the appointment
    await Appointment.deleteOne({ id: appointmentId });
    
    // Send cancellation email
    try {
      await EmailService.sendCancellationEmail(appointment);
      console.log(`Cancellation email sent to ${appointment.email}`);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      
      // Send admin notification about email failure
      try {
        await EmailService.sendAdminNotification('ADMIN_CANCELLATION_EMAIL_FAILED', {
          appointmentId: appointment.id,
          email: appointment.email,
          error: emailError.message
        });
      } catch (adminNotifError) {
        console.error('Failed to send admin notification:', adminNotifError);
      }
    }
    
    // Send Telegram notification
    const cancelMessage = `
<b>❌ Appointment Cancelled by Admin</b>

<b>Client:</b> ${appointment.name}
<b>Date:</b> ${appointment.formattedDate}
<b>Time:</b> ${appointment.formattedTime}

Cancelled at: ${new Date().toLocaleString()}
`;

    try {
      await sendTelegramNotification(cancelMessage);
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
    }
    
    return appointment;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
}

// Refresh available slots
async function refreshAvailableSlots() {
  try {
    // Clear existing slots
    await Slot.deleteMany({});
    
    // Generate new slots
    const newSlots = generateDefaultSlots();
    
    // Save to database
    await Slot.insertMany(newSlots);
    
    // Log the number of new slots
    console.log(`Refreshed available slots: ${newSlots.length} slots created`);
    
    return newSlots;
  } catch (error) {
    console.error('Error refreshing available slots:', error);
    return [];
  }
}

// Initialize appointment system
async function initialize() {
  try {
    // Check if we have slots, if not create them
    const slotsCount = await Slot.countDocuments();
    if (slotsCount === 0) {
      console.log('No slots found, generating initial slots...');
      const newSlots = generateDefaultSlots();
      await Slot.insertMany(newSlots);
      console.log(`Created ${newSlots.length} initial appointment slots`);
    } else {
      console.log(`Found ${slotsCount} existing slots`);
    }
    
    // Get appointment count
    const appointmentsCount = await Appointment.countDocuments();
    
    console.log(`Initialized appointment system with ${slotsCount} available slots and ${appointmentsCount} existing appointments`);
    
    // Send a test notification to verify Telegram is working
    try {
      await sendTelegramNotification('✅ <b>Appointment system initialized</b>\nReady to receive booking notifications.');
      console.log('Telegram notification system is working!');
    } catch (error) {
      console.error('Failed to send test Telegram notification:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing appointment system:', error);
    return false;
  }
}

module.exports = {
  initialize,
  getAvailableSlots,
  bookAppointment,
  getAllAppointments,
  cancelAppointment,
  refreshAvailableSlots,
  sendTelegramNotification,
  verifyAppointment,
  cancelAppointmentByToken
};