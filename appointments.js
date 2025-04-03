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

// Generate appointment slots for the next 12 months - FIXED VERSION
function generateDefaultSlots() {
  console.log("Generating default slots for a full year");
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
        // Create a new date object for this slot to avoid reference issues
        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);
        
        // Skip times that are in the past
        if (slotDate > now) {
          const formattedDate = slotDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric', 
            year: 'numeric'
          });
          
          const formattedTime = slotDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
          
          slots.push({
            id: slotDate.toISOString(),
            date: slotDate.toISOString(),
            formattedDate: formattedDate,
            formattedTime: formattedTime,
            available: true
          });
        }
      }
    }
  }
  
  console.log(`Generated ${slots.length} slots for the next year`);
  return slots;
}

// Get available appointment slots - FIXED VERSION
async function getAvailableSlots(startDate, endDate) {
  try {
    console.log("getAvailableSlots called:", 
      startDate ? startDate.toISOString() : 'default', 
      endDate ? endDate.toISOString() : 'default');
    
    // Default to showing slots for an entire year if no date range specified
    if (!startDate) {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0); // Beginning of today
    }
    
    if (!endDate) {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // Show a full year of slots
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Convert to ISO strings for comparison
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();
    
    console.log(`Querying date range from ${startIso} to ${endIso}`);
    
    // First check if we have any slots
    const totalSlots = await Slot.countDocuments();
    console.log(`Total slots in database: ${totalSlots}`);
    
    if (totalSlots === 0) {
      console.log("No slots found in database, generating new slots...");
      await refreshAvailableSlots();
      console.log("Slots refreshed, continuing with query");
    }
    
    // Get all appointments for this date range
    const appointments = await Appointment.find({
      dateTime: { $gte: startIso, $lte: endIso }
    });
    
    console.log(`Found ${appointments.length} existing appointments in date range`);
    
    // Get slots for the specified date range
    let slots = await Slot.find({
      date: { $gte: startIso, $lte: endIso }
    });
    
    console.log(`Found ${slots.length} slots in date range`);
    
    // If no slots found in the date range, check for database issues
    if (slots.length === 0 && totalSlots > 0) {
      console.log("No slots found in specified date range despite having slots in database");
      console.log("This may indicate a date range mismatch or database inconsistency");
      
      // Try to find some sample slots to diagnose the issue
      const sampleSlots = await Slot.find().limit(5);
      if (sampleSlots.length > 0) {
        console.log("Sample slots:", sampleSlots.map(s => s.date));
      }
    }
    
    // Filter out slots that are already booked
    const bookedTimes = new Set(appointments.map(app => app.dateTime));
    const now = new Date();
    
    const availableSlots = slots.filter(slot => {
      const slotDate = new Date(slot.date);
      // Only filter out slots that are already booked or in the past
      return !bookedTimes.has(slot.date) && slotDate > now;
    });
    
    console.log(`After filtering, ${availableSlots.length} slots are available`);
    
    // If no available slots after filtering but we found slots in the date range
    if (availableSlots.length === 0 && slots.length > 0) {
      console.log("All slots were filtered out. Check for booking conflicts or past dates.");
    }
    
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

// Refresh available slots - FIXED VERSION
async function refreshAvailableSlots() {
  try {
    console.log("Starting to refresh available slots...");
    
    // Clear existing slots
    const deleteResult = await Slot.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing slots`);
    
    // Generate new slots
    const newSlots = generateDefaultSlots();
    console.log(`Generated ${newSlots.length} new slots`);
    
    if (newSlots.length === 0) {
      console.error("Error: No new slots were generated!");
      return [];
    }
    
    // Save to database in batches to avoid memory issues
    const BATCH_SIZE = 1000;
    let inserted = 0;
    
    for (let i = 0; i < newSlots.length; i += BATCH_SIZE) {
      const batch = newSlots.slice(i, i + BATCH_SIZE);
      await Slot.insertMany(batch);
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${newSlots.length} slots`);
    }
    
    console.log(`Successfully refreshed available slots: ${inserted} slots created`);
    return newSlots;
  } catch (error) {
    console.error('Error refreshing available slots:', error);
    return [];
  }
}

// Initialize appointment system - FIXED VERSION
async function initialize() {
  try {
    console.log("Initializing appointment system...");
    
    // Check if we have slots, if not create them
    const slotsCount = await Slot.countDocuments();
    console.log(`Found ${slotsCount} existing slots`);
    
    if (slotsCount === 0) {
      console.log('No slots found, creating initial slots...');
      await refreshAvailableSlots();
    } else {
      // Check if we have future slots
      const now = new Date();
      const futureSlots = await Slot.countDocuments({
        date: { $gt: now.toISOString() }
      });
      
      console.log(`Found ${futureSlots} future slots`);
      
      // If no future slots, refresh them
      if (futureSlots === 0) {
        console.log('No future slots available, refreshing slots...');
        await refreshAvailableSlots();
      }
    }
    
    // Get updated slot counts
    const updatedSlotsCount = await Slot.countDocuments();
    const now = new Date();
    const updatedFutureSlots = await Slot.countDocuments({
      date: { $gt: now.toISOString() }
    });
    
    // Get appointment count
    const appointmentsCount = await Appointment.countDocuments();
    
    console.log(`Initialized appointment system with ${updatedSlotsCount} total slots, ${updatedFutureSlots} future slots, and ${appointmentsCount} existing appointments`);
    
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