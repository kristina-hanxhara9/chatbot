// transform-ai-server.js - Complete server with all functionality
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const mongoose = require('mongoose');

// Import database functions
const { 
  connectToDatabase, 
  getOrCreateConversation, 
  saveMessage, 
  getConversationMessages 
} = require('./db');

// Import appointment system
const appointments = require('./appointments');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all origins in development
app.use(cors());

// Add Content Security Policy headers
// Add Content Security Policy headers
app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' *; font-src 'self' https://cdn.scite.ai https://cdn.jsdelivr.net data:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.scite.ai"
    );
    next();
  });
// Conversation state management
const conversationStates = new Map();

// Memory storage fallback (for when DB connection fails)
const memoryStorage = {
    conversations: new Map(),
    messages: new Map(),
    
    getOrCreateConversation(sessionId) {
        if (!this.conversations.has(sessionId)) {
            const conversationId = uuidv4();
            this.conversations.set(sessionId, {
                id: conversationId,
                session_id: sessionId,
                started_at: new Date().toISOString(),
                last_message_at: new Date().toISOString()
            });
            this.messages.set(conversationId, []);
        }
        const conversation = this.conversations.get(sessionId);
        conversation.last_message_at = new Date().toISOString();
        return conversation;
    },
    
    saveMessage(conversationId, content, isUser) {
        if (!this.messages.has(conversationId)) {
            this.messages.set(conversationId, []);
        }
        const messageId = uuidv4();
        const message = {
            id: messageId,
            conversation_id: conversationId,
            content,
            is_user: isUser,
            timestamp: new Date().toISOString()
        };
        this.messages.get(conversationId).push(message);
        return message;
    },
    
    getConversationMessages(conversationId) {
        return this.messages.get(conversationId) || [];
    },
    
    // For admin panel - get all conversations
    getAllConversations() {
        return Array.from(this.conversations.values()).map(convo => {
            const msgs = this.messages.get(convo.id) || [];
            return {
                ...convo,
                _id: convo.id, // Add _id for consistency with MongoDB
                message_count: msgs.length
            };
        }).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
    },
    
    // For admin panel - get messages for a conversation
    getMessagesForConversation(conversationId) {
        return this.messages.get(conversationId) || [];
    }
};

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Global variable to track if MongoDB is connected
let isMongoConnected = false;

// Function to check if the user wants to exit the booking flow
function wantsToExitBooking(message) {
    const exitKeywords = [
        'nevermind',
        'never mind',
        'cancel',
        'stop',
        'exit',
        'quit',
        'different topic',
        'something else',
        'different question',
        'forget it'
    ];
    
    return exitKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
    );
}

// Function to check if user wants to change booking details
function wantsToChangeBooking(message) {
    const changeKeywords = [
        'different time',
        'different date',
        'another time',
        'another date',
        'change time',
        'change date',
        'reschedule',
        'i want to cancel',
        'cancel my meeting',
        'cancel my appointment',
        'different day'
    ];
    
    return changeKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
    );
}

// Improved date parsing function
function parseUserDate(dateString) {
    // Get current date information
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    // Try to handle various date formats
    let parsedDate;
    
    // Check for month name formats like "March 25" or "March 25th"
    const monthNameRegex = /(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?/i;
    const monthNameMatch = dateString.match(monthNameRegex);
    
    if (monthNameMatch) {
        const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        const monthNameLower = monthNameMatch[0].toLowerCase().split(" ")[0];
        let monthIndex = -1;
        
        // Find the month index
        for (let i = 0; i < monthNames.length; i++) {
            if (monthNames[i].startsWith(monthNameLower)) {
                monthIndex = i;
                break;
            }
        }
        
        if (monthIndex !== -1) {
            const day = parseInt(monthNameMatch[1]);
            
            // Determine the appropriate year
            let year = currentYear;
            
            // If the specified month and day is earlier than the current date, use next year
            // But only if we're more than 7 days past the specified date
            const specifiedDate = new Date(year, monthIndex, day);
            const timeDiff = currentDate - specifiedDate;
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            
            if (daysDiff > 7) {
                year = currentYear + 1;
            }
            
            parsedDate = new Date(year, monthIndex, day);
        }
    } 
    // If not a month name format, try standard date parser
    else {
        parsedDate = new Date(dateString);
        
        // If it's a valid date but doesn't include a year, set to current or next year
        if (!isNaN(parsedDate.getTime()) && !dateString.includes(currentYear.toString())) {
            // Check if the date is more than 7 days in the past
            const timeDiff = currentDate - parsedDate;
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            
            if (daysDiff > 7) {
                parsedDate.setFullYear(currentYear + 1);
            } else {
                parsedDate.setFullYear(currentYear);
            }
        }
    }
    
    return parsedDate;
}

// Booking conversation flow handler
async function handleBookingFlow(sessionId, message) {
    // Initialize or retrieve conversation state
    if (!conversationStates.has(sessionId)) {
        conversationStates.set(sessionId, {
            stage: 'confirm_booking',
            bookingDetails: {}
        });
    }
    
    const state = conversationStates.get(sessionId);
    
    try {
        const normalizedMessage = message.toLowerCase().trim();
        
        // Check if user wants to exit the booking flow (unless they're just confirming details)
        if (wantsToExitBooking(normalizedMessage) && state.stage !== 'confirm_details') {
            conversationStates.delete(sessionId);
            return "I understand you want to talk about something else. The booking process has been cancelled. How can I help you today?";
        }
        
        // If they want to change booking details and they're already in a booking flow
        if (wantsToChangeBooking(normalizedMessage) && state.stage !== 'confirm_booking') {
            // Reset to the beginning of the booking flow
            state.stage = 'confirm_booking';
            state.bookingDetails = {};
            return "I understand you want to change the booking details. Let's start over with the booking process. Would you like to book a meeting?";
        }
        
        switch(state.stage) {
            case 'confirm_booking':
                // Initial booking confirmation
                state.stage = 'select_day';
                return `📅 Would you like to book a meeting?

Choose your preferred timeframe:
• This week
• Next week
• Next month

Or type a specific date (e.g., March 25)

You can say "cancel" at any time to exit the booking process.`;
            
            case 'select_day':
                const now = new Date();
                let selectedDates = [];
                
                // Check for specific date input using improved parser
                const parsedDate = parseUserDate(normalizedMessage);
                
                if (!isNaN(parsedDate.getTime())) {
                    // Validate the parsed date - more lenient check for current date
                    const currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0); // Set to beginning of day
                    
                    // Only consider a date "in the past" if it's more than 1 day before today
                    const oneDayMs = 24 * 60 * 60 * 1000;
                    if (parsedDate < new Date(currentDate.getTime() - oneDayMs)) {
                        return `❌ Invalid Date
The date you selected (${parsedDate.toLocaleDateString()}) is in the past. Please choose a future date.

Choose your preferred timeframe:
• This week
• Next week
• Next month

Or type a specific date (e.g., March 25)`;
                    }
                    
                    // Check availability for the specific date
                    const slots = await appointments.getAvailableSlots();
                    const availableSlotsForDate = slots.filter(slot => {
                        const slotDate = new Date(slot.id);
                        return (
                            slotDate.getFullYear() === parsedDate.getFullYear() &&
                            slotDate.getMonth() === parsedDate.getMonth() &&
                            slotDate.getDate() === parsedDate.getDate()
                        );
                    });
                    
                    // If no slots available for that date
                    if (availableSlotsForDate.length === 0) {
                        // Find the next available dates - IMPROVED to handle unique dates
                        const availableDatesMap = new Map(); // Using Map to ensure date uniqueness
                        
                        slots
                            .filter(slot => new Date(slot.id) >= currentDate)
                            .forEach(slot => {
                                const slotDate = new Date(slot.id);
                                const dateKey = slotDate.toDateString(); // Use date string as key
                                
                                // Only add this date if we haven't seen it before
                                if (!availableDatesMap.has(dateKey)) {
                                    availableDatesMap.set(dateKey, slotDate);
                                }
                            });
                        
                        // Convert the Map values to an array and take the first 3
                        const nextAvailableDates = Array.from(availableDatesMap.values()).slice(0, 3);
                        
                        if (nextAvailableDates.length === 0) {
                            return `❌ No available slots on ${parsedDate.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                            })} and no upcoming available dates found.

Please check back later or contact us directly.

Would you like to discuss something else instead? (Type 'yes' to exit booking)`;
                        }
                        
                        return `❌ No available slots on ${parsedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                        })}

Next available dates:
${nextAvailableDates.map((date, index) => 
    `${index + 1}. ${date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    })}`
).join('\n')}

Would you like to choose one of these dates (reply with a number) or try another date?

You can also type "cancel" to exit the booking process.`;
                    }
                    
                    // If slots are available, proceed with the specific date
                    selectedDates = [parsedDate];
                } else if (normalizedMessage === 'this week') {
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday
                    
                    // Check availability for this week
                    const slots = await appointments.getAvailableSlots();
                    const availableSlotsThisWeek = slots.filter(slot => {
                        const slotDate = new Date(slot.id);
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 4); // Friday
                        endOfWeek.setHours(23, 59, 59);
                        
                        return slotDate >= now && slotDate <= endOfWeek;
                    });
                    
                    if (availableSlotsThisWeek.length === 0) {
                        return `❌ No available slots for this week.

Would you like to check next week instead?

You can also type "cancel" to exit the booking process.`;
                    }
                    
                    // Get unique dates from available slots
                    const uniqueDates = [...new Set(availableSlotsThisWeek.map(slot => {
                        const date = new Date(slot.id);
                        return date.toDateString();
                    }))].map(dateStr => new Date(dateStr));
                    
                    selectedDates = uniqueDates.slice(0, 3);
                } else if (normalizedMessage === 'next week') {
                    const today = new Date(now);
                    const startOfNextWeek = new Date(today);
                    startOfNextWeek.setDate(today.getDate() + (7 - today.getDay()) + (today.getDay() === 0 ? 0 : 1)); // Next Monday
                    
                    // Check availability for next week
                    const slots = await appointments.getAvailableSlots();
                    const availableSlotsNextWeek = slots.filter(slot => {
                        const slotDate = new Date(slot.id);
                        const endOfNextWeek = new Date(startOfNextWeek);
                        endOfNextWeek.setDate(startOfNextWeek.getDate() + 4); // Friday
                        endOfNextWeek.setHours(23, 59, 59);
                        
                        return slotDate >= startOfNextWeek && slotDate <= endOfNextWeek;
                    });
                    
                    if (availableSlotsNextWeek.length === 0) {
                        return `❌ No available slots for next week.

Would you like to check dates in the next month instead?

You can also type "cancel" to exit the booking process.`;
                    }
                    
                    // Get unique dates from available slots
                    const uniqueDates = [...new Set(availableSlotsNextWeek.map(slot => {
                        const date = new Date(slot.id);
                        return date.toDateString();
                    }))].map(dateStr => new Date(dateStr));
                    
                    selectedDates = uniqueDates.slice(0, 3);
                } else if (normalizedMessage === 'next month') {
                    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);
                    
                    // Check availability for next month
                    const slots = await appointments.getAvailableSlots();
                    const availableSlotsNextMonth = slots.filter(slot => {
                        const slotDate = new Date(slot.id);
                        return slotDate >= startOfNextMonth && slotDate <= endOfNextMonth;
                    });
                    
                    if (availableSlotsNextMonth.length === 0) {
                        return `❌ No available slots for next month.

Would you like to try a specific date instead?

You can also type "cancel" to exit the booking process.`;
                    }
                    
                    // Get unique dates from available slots
                    const uniqueDates = [...new Set(availableSlotsNextMonth.map(slot => {
                        const date = new Date(slot.id);
                        return date.toDateString();
                    }))].map(dateStr => new Date(dateStr));
                    
                    selectedDates = uniqueDates.slice(0, 3);
                } else if (normalizedMessage === 'yes' && state.exitPrompt) {
                    // Handle exit from booking flow
                    conversationStates.delete(sessionId);
                    return "Great! Let's talk about something else. How can I help you today?";
                } else {
                    // Invalid input
                    return `❌ Invalid Date Selection

Please choose:
• This week
• Next week
• Next month

Or type a specific date (e.g., March 25)

You can also type "cancel" to exit the booking process.`;
                }
                
                // If no valid dates, ask again
                if (selectedDates.length === 0) {
                    state.exitPrompt = true;
                    return `❌ No Available Dates found matching your criteria.

Please choose:
• This week
• Next week
• Next month

Or type a specific date (e.g., March 25)

Would you like to exit the booking process? Reply with "yes" to exit or "no" to continue.`;
                }
                
                // Convert to formatted dates
                const availableDates = selectedDates.map(date => ({
                    date: date,
                    formattedDate: date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                    })
                }));
                
                state.availableDates = availableDates;
                state.stage = 'select_time';
                
                return `📅 Available Dates:
${availableDates.map((dateObj, index) => 
    `${index + 1}. ${dateObj.formattedDate}`
).join('\n')}

Choose a date by typing its number.

You can type "cancel" to exit the booking process.`;
            
            case 'select_time':
                // Check if the message is a number corresponding to a date
                const selectedDateIndex = parseInt(message) - 1;
                
                if (isNaN(selectedDateIndex) || 
                    selectedDateIndex < 0 || 
                    selectedDateIndex >= state.availableDates.length) {
                    return `❌ Invalid Date Selection

Choose a date by its number:
${state.availableDates.map((dateObj, index) => 
    `${index + 1}. ${dateObj.formattedDate}`
).join('\n')}

You can type "cancel" to exit the booking process.`;
                }
                
                const selectedDate = state.availableDates[selectedDateIndex];
                state.bookingDetails.selectedDate = selectedDate;
                
                // Check availability for this specific date
                const slots = await appointments.getAvailableSlots();
                const availableSlotsForDate = slots.filter(slot => {
                    const slotDate = new Date(slot.id);
                    const bookingDate = new Date(selectedDate.date);
                    
                    return (
                        slotDate.getFullYear() === bookingDate.getFullYear() &&
                        slotDate.getMonth() === bookingDate.getMonth() &&
                        slotDate.getDate() === bookingDate.getDate()
                    );
                });
                
                // Extract available times from slots
                const availableTimes = availableSlotsForDate.map(slot => {
                    const slotDate = new Date(slot.id);
                    return slotDate.toLocaleTimeString('en-US', { 
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    });
                });
                
                // Check if we have available times for the selected date
                if (availableTimes.length === 0) {
                    return `❌ Sorry, there are no available time slots for ${selectedDate.formattedDate}.

Please choose another date:
${state.availableDates.map((dateObj, index) => 
    `${index + 1}. ${dateObj.formattedDate}`
).join('\n')}

You can type "cancel" to exit the booking process.`;
                }
                
                state.availableTimeSlots = availableTimes;
                state.stage = 'confirm_time';
                
                return `🕒 Available Times for ${selectedDate.formattedDate}:
${availableTimes.map((time, index) => 
    `${index + 1}. ${time}`
).join('\n')}

Choose a time by typing its number.

You can type "cancel" to exit the booking process.`;
            
            case 'confirm_time':
                const selectedTimeIndex = parseInt(message) - 1;
                
                if (isNaN(selectedTimeIndex) || 
                    selectedTimeIndex < 0 || 
                    selectedTimeIndex >= state.availableTimeSlots.length) {
                    return `❌ Invalid Time Selection

Choose a time by its number:
${state.availableTimeSlots.map((time, index) => 
    `${index + 1}. ${time}`
).join('\n')}

You can type "cancel" to exit the booking process.`;
                }
                
                const selectedTime = state.availableTimeSlots[selectedTimeIndex];
                state.bookingDetails.selectedTime = selectedTime;
                state.stage = 'confirm_details';
                
                return `✅ You selected:
📅 Date: ${state.bookingDetails.selectedDate.formattedDate}
🕒 Time: ${selectedTime}

Would you like to continue with this booking? (yes/no)`;
            
            case 'confirm_details':
                const confirmation = message.toLowerCase().trim();
                
                if (confirmation === 'no') {
                    // Reset to the beginning of the booking flow
                    state.stage = 'select_day';
                    return `Would you like to select a different date and time? 

Choose your preferred timeframe:
• This week
• Next week
• Next month

Or type a specific date (e.g., March 25)

You can type "cancel" to exit the booking process completely.`;
                }
                
                if (confirmation !== 'yes') {
                    return `❓ Please confirm:
📅 Date: ${state.bookingDetails.selectedDate.formattedDate}
🕒 Time: ${state.bookingDetails.selectedTime}

Type 'yes' to continue or 'no' to choose a different date/time.

You can type "cancel" to exit the booking process completely.`;
                }
                
                state.stage = 'get_name';
                return "What's your full name?";
            
            case 'get_name':
                if (!message.trim()) {
                    return "❌ Name Required\n\nPlease enter your full name.";
                }
                state.bookingDetails.name = message.trim();
                state.stage = 'get_email';
                return `✍️ Name Confirmed
Name: ${state.bookingDetails.name}

What's your email address?`;
            
            case 'get_email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(message)) {
                    return "❌ Invalid Email\n\nPlease enter a valid email address.";
                }
                state.bookingDetails.email = message.trim();
                state.stage = 'get_topic';
                return `📧 Email Confirmed
Email: ${state.bookingDetails.email}

What would you like to discuss in the meeting?`;
            
            case 'get_topic':
                state.bookingDetails.topic = message.trim() || 'General Consultation';
                
                try {
                    // Create a complete date object for booking
                    const fullDateTime = new Date(state.bookingDetails.selectedDate.date);
                    const timeMatch = state.bookingDetails.selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    
                    if (!timeMatch) {
                        throw new Error("Invalid time format");
                    }
                    
                    const [_, hours, minutes, period] = timeMatch;
                    let adjustedHours = parseInt(hours);
                    if (period.toUpperCase() === 'PM' && adjustedHours !== 12) adjustedHours += 12;
                    if (period.toUpperCase() === 'AM' && adjustedHours === 12) adjustedHours = 0;
                    
                    fullDateTime.setHours(adjustedHours, parseInt(minutes), 0, 0);
                    
                    // Final check for past dates/times
                    const now = new Date();
                    if (fullDateTime <= now) {
                        throw new Error("Cannot book a meeting in the past");
                    }
                    
                    const appointment = await appointments.bookAppointment(
                        fullDateTime.toISOString(), 
                        state.bookingDetails.name, 
                        state.bookingDetails.email, 
                        state.bookingDetails.topic
                    );
                    
                    // Set the conversation to booking complete
                    state.stage = 'booking_complete';
                    
                    return `🎉 Booking Confirmed!

Appointment Details:
📅 Date: ${state.bookingDetails.selectedDate.formattedDate}
🕒 Time: ${state.bookingDetails.selectedTime}
👤 Name: ${state.bookingDetails.name}
✉️ Email: ${state.bookingDetails.email}
💡 Topic: ${state.bookingDetails.topic}

A confirmation email has been sent to ${state.bookingDetails.email}.

Is there anything else I can help you with? Feel free to ask any other questions.`;
                } catch (error) {
                    // Reset the conversation state
                    conversationStates.delete(sessionId);
                    return `❌ Booking Error
Sorry, there was an error booking your appointment: ${error.message}

Would you like to try again? Say 'book' to restart or ask me something else.`;
                }
            
            case 'booking_complete':
                // Reset the conversation state
                conversationStates.delete(sessionId);
                return "Great! What would you like to discuss now?";
                
            default:
                conversationStates.delete(sessionId);
                return "🤔 Something went wrong\n\nLet's start over. Would you like to book a meeting?";
        }
    } catch (error) {
        console.error('Booking flow error:', error);
        conversationStates.delete(sessionId);
        return "❌ Unexpected Error\n\nSorry, an unexpected error occurred. Would you like to try booking again?";
    }
}

// Function to check if message is a booking request
function isBookingRequest(message) {
    const bookingKeywords = [
        'book a meeting', 
        'schedule a call', 
        'book a demo', 
        'schedule a meeting',
        'schedule time',
        'book a consultation',
        'book a call',
        'meet with you',
        'setup a call',
        'book an appointment',
        'i want to book',
        'book'
    ];
    
    return bookingKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
    );
}

// Get Gemini AI model with proper error handling
function getGeminiModel() {
    try {
        // Try with the most likely correct model name for Gemini 1.5
        return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    } catch (error) {
        console.warn("First model attempt failed, trying alternative names...");
        try {
            // Try with alternate naming conventions
            return genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });
        } catch (secondError) {
            console.warn("Second model attempt failed, trying final fallback...");
            // Final fallback to older model if needed
            return genAI.getGenerativeModel({ model: "gemini-pro" });
        }
    }
}

// Predefined responses for common questions
const predefinedResponses = {
    "chatbot solutions": "We offer custom chatbots for customer service, sales, and internal processes. What specific need are you looking to address? Happy to share examples.",
    "ai agents": "Our AI agents can automate tasks, analyze data, and integrate with your systems. What processes are you looking to improve?",
    "implementation process": "Our implementation takes 2-4 weeks: planning, development, testing, and deployment. Would you like to see our approach in action?",
    "pricing": "Pricing starts at $99/month based on features and volume. Would you like me to connect you with our sales team for a custom quote?",
    "demo": "We'd be happy to show you a demo! Would you like to book a time with our team? I can help schedule that right now.",
    "services": "We specialize in AI chatbots, automation systems, and data analytics solutions. Which specific service would you like to know more about?",
    "your services": "Our services include custom AI chatbots, process automation, and intelligent analytics. What particular area interests you most?"
};

// Generate AI response
async function generateAIResponse(userMessage, conversationHistory = [], sessionId = null) {
    try {
        // Check if there's an active booking state
        if (conversationStates.has(sessionId)) {
            const state = conversationStates.get(sessionId);
            
            // Special handling for booking-related requests
            if (wantsToChangeBooking(userMessage)) {
                return await handleBookingFlow(sessionId, userMessage);
            }
            
            // If they're in the middle of booking and want to talk about something else
            if (wantsToExitBooking(userMessage)) {
                conversationStates.delete(sessionId);
                return "I understand you want to talk about something else. The booking process has been cancelled. How can I help you today?";
            }
            
            // Continue with the booking flow if they're in it
            return await handleBookingFlow(sessionId, userMessage);
        }
        
        // Check if this is a new booking request
        if (isBookingRequest(userMessage)) {
            return await handleBookingFlow(sessionId, userMessage);
        }
        
        // Expanded service detection - check if message is asking about services
        const messageLower = userMessage.toLowerCase();
        
        // Check for general services inquiry with expanded keywords
        if (messageLower.includes("service") || 
            messageLower.includes("what do you offer") || 
            messageLower.includes("what can you do") ||
            messageLower.includes("tell me about") ||
            messageLower.includes("want to ask") ||
            messageLower.includes("want to know")) {
            
            return "We offer AI chatbots, process automation, and data analytics solutions for businesses. Which specific service would you like to learn more about?";
        }
        
        // Check for predefined responses for specific services
        for (const [key, response] of Object.entries(predefinedResponses)) {
            if (messageLower.includes(key)) {
                return response;
            }
        }
        
        const model = getGeminiModel();
        
        // Format conversation history for context
        let historyText = '';
        if (conversationHistory && conversationHistory.length > 0) {
            historyText = conversationHistory.map(msg => {
                const role = msg.is_user ? 'USER' : 'ASSISTANT';
                return `${role}: ${msg.content}`;
            }).join('\n');
        }
        
        // Enhanced prompt template with stronger instructions against verbose responses
        const promptTemplate = process.env.AI_SOLUTIONS_PROMPT || 
`
You are a friendly AI assistant for Transform AI Solutions. Keep your answers brief, conversational, and end with a question.

Our mission: We make AI affordable and accessible for small and medium businesses, helping them unlock the power of AI without high costs, just the benefits. We help businesses transform by improving marketing strategies, client acquisition, relationship management, and workflow efficiency.

When responding:
1. Keep responses under 30 words whenever possible
2. Use casual, friendly tone - no formal business language
3. End EVERY response with a specific question to continue the conversation
4. Be enthusiastic about how AI can transform businesses and "give them a hand"
5. Emphasize affordability and practical benefits for smaller businesses
6. Focus on how AI reduces workload so businesses can focus on what they do best
7. Never provide lengthy explanations
8. Always present AI as a transformative but accessible technology

Company info: Transform AI Solutions helps businesses evolve through affordable AI implementation, like transforming a caterpillar into a butterfly.

QUESTION: {{QUESTION}}
`;
        
        // Prepare the complete prompt
        let fullPrompt;
        if (historyText) {
            fullPrompt = historyText + '\n\nUser: ' + userMessage;
        } else {
            fullPrompt = promptTemplate.replace('{{QUESTION}}', userMessage);
        }
        
        // Generate response with Gemini
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        let responseText = response.text();
        
        // Post-process the response to remove any thought process patterns or response type indicators
        responseText = responseText
            .replace(/^(Response:|Answer:|Bot:|Assistant:|AI:)/i, '')
            .replace(/^(Thinking:|Analysis:|Let me think:|Here's my thought process:).*?\n\n/is, '')
            .replace(/^[\s\n]*/, '')
            .trim();
            
        return responseText;
    } catch (error) {
        console.error('Error generating AI response:', error);
        return "I'm sorry, I encountered an error while processing your request. Please try again later.";
    }
}

// Routes
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Transform AI Chatbot server is running',
        mongodb: isMongoConnected ? 'connected' : 'disconnected'
    });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const { message, sessionId: existingSessionId } = req.body;
        
        // Generate a new session ID if not provided
        const sessionId = existingSessionId || uuidv4();
        
        let conversation;
        let messages = [];
        
        // Try to use MongoDB if connected, otherwise fall back to memory
        if (isMongoConnected) {
            try {
                // Get or create conversation in MongoDB
                conversation = await getOrCreateConversation(sessionId);
                await saveMessage(conversation._id, message, true);
                messages = await getConversationMessages(conversation._id);
            } catch (error) {
                console.error('MongoDB error, falling back to memory storage:', error);
                // Fall back to memory storage
                conversation = memoryStorage.getOrCreateConversation(sessionId);
                memoryStorage.saveMessage(conversation.id, message, true);
                messages = memoryStorage.getConversationMessages(conversation.id);
            }
        } else {
            // Use memory storage
            conversation = memoryStorage.getOrCreateConversation(sessionId);
            memoryStorage.saveMessage(conversation.id, message, true);
            messages = memoryStorage.getConversationMessages(conversation.id);
        }
        
        // Generate AI response
        const aiResponse = await generateAIResponse(message, messages, sessionId);
        
        // Save AI response
        if (isMongoConnected) {
            try {
                await saveMessage(conversation._id, aiResponse, false);
            } catch (error) {
                console.error('Error saving AI response to MongoDB:', error);
                // Fall back to memory storage
                memoryStorage.saveMessage(conversation.id, aiResponse, false);
            }
        } else {
            memoryStorage.saveMessage(conversation.id, aiResponse, false);
        }
        
        // Return response to client
        res.status(200).json({
            response: aiResponse,
            sessionId: sessionId
        });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing your request',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get available slots
app.get('/api/appointments/slots', async (req, res) => {
    try {
        // Get optional query parameters
        const startDateParam = req.query.startDate;
        const endDateParam = req.query.endDate;
        
        // Parse dates if provided
        const startDate = startDateParam ? new Date(startDateParam) : null;
        const endDate = endDateParam ? new Date(endDateParam) : null;
        
        // Call getAvailableSlots with parameters
        const slots = await appointments.getAvailableSlots(startDate, endDate);
        res.json(slots);
    } catch (error) {
        console.error('Error getting available slots:', error);
        res.status(500).json({ error: 'Failed to get available slots' });
    }
});

// Book an appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const { slotId, name, email, topic } = req.body;
        
        if (!slotId || !name || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const appointment = await appointments.bookAppointment(slotId, name, email, topic);
        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: error.message || 'Failed to book appointment' });
    }
});

// Get all appointments
app.get('/api/appointments', async (req, res) => {
    try {
        const allAppointments = await appointments.getAllAppointments();
        res.json(allAppointments);
    } catch (error) {
        console.error('Error getting appointments:', error);
        res.status(500).json({ error: 'Failed to get appointments' });
    }
});

// Cancel an appointment (admin function)
app.delete('/api/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cancelled = await appointments.cancelAppointment(id);
        res.json(cancelled);
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: error.message || 'Failed to cancel appointment' });
    }
});

// Refresh available slots
app.post('/api/appointments/slots/refresh', async (req, res) => {
    try {
        const slots = await appointments.refreshAvailableSlots();
        res.json(slots);
    } catch (error) {
        console.error('Error refreshing slots:', error);
        res.status(500).json({ error: 'Failed to refresh slots' });
    }
});

// Verify appointment token (for cancellation page)
app.get('/api/appointments/verify/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.query;
        
        if (!id || !token) {
            return res.status(400).json({ error: 'Missing appointment ID or token' });
        }
        
        const appointment = await appointments.verifyAppointment(id, token);
        res.json(appointment);
    } catch (error) {
        console.error('Error verifying appointment:', error);
        res.status(404).json({ error: error.message || 'Appointment not found or token invalid' });
    }
});

// Cancel appointment with token
app.post('/api/appointments/cancel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.body;
        
        if (!id || !token) {
            return res.status(400).json({ error: 'Missing appointment ID or token' });
        }
        
        const cancelled = await appointments.cancelAppointmentByToken(id, token);
        res.json(cancelled);
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(400).json({ error: error.message || 'Failed to cancel appointment' });
    }
});

// Admin API routes
app.get('/api/admin/conversations', async (req, res) => {
    try {
        if (isMongoConnected) {
            const { Conversation } = require('./models');
            const { Message } = require('./models');
            
            // Get all conversations
            const conversations = await Conversation.find().sort({ last_message_at: -1 });
            
            // Count messages for each conversation
            const conversationsWithCounts = await Promise.all(
                conversations.map(async (conversation) => {
                    const count = await Message.countDocuments({ conversation_id: conversation._id });
                    return {
                        ...conversation.toObject(),
                        message_count: count
                    };
                })
            );
            
            res.json({ conversations: conversationsWithCounts });
        } else {
            // Use memory storage
            const conversations = memoryStorage.getAllConversations();
            res.json({ conversations });
        }
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ error: 'Error retrieving conversations' });
    }
});

app.get('/api/admin/conversations/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (isMongoConnected) {
            const { Message } = require('./models');
            
            // Get all messages for conversation
            const messages = await Message.find({ conversation_id: id }).sort({ timestamp: 1 });
            res.json({ messages });
        } else {
            // Use memory storage
            const messages = memoryStorage.getMessagesForConversation(id);
            res.json({ messages });
        }
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ error: 'Error retrieving messages' });
    }
});

// Serve the widget HTML
app.use('/', express.static(path.join(__dirname, 'widget')));

// Initialize database connection and start server
async function startServer() {
    try {
        console.log('Starting server...');
        
        // Try to connect to MongoDB first - IMPORTANT CHANGE
        let mongoConnection = null;
        if (process.env.USE_MEMORY_STORAGE !== 'true') {
            try {
                console.log('Attempting to connect to MongoDB...');
                mongoConnection = await connectToDatabase();
                if (mongoConnection) {
                    isMongoConnected = true;
                    console.log('Connected to MongoDB successfully');
                } else {
                    console.warn('MongoDB connection returned null, using memory storage');
                    isMongoConnected = false;
                }
            } catch (error) {
                console.warn('MongoDB connection error, using memory storage:', error);
                isMongoConnected = false;
            }
        } else {
            console.log('Memory storage mode enabled by configuration');
            isMongoConnected = false;
        }
        
        // Only initialize appointment system AFTER MongoDB connection is established
        if (isMongoConnected) {
            console.log('Initializing appointment system...');
            await appointments.initialize();
            console.log('Appointment system initialized');
        } else {
            console.log('Skipping MongoDB-based appointment initialization');
            // You might want to initialize a file-based fallback here
        }
        
        // Start the Express server
        app.listen(PORT, () => {
            console.log(`Transform AI Solutions server running on port ${PORT}`);
            console.log(`Data storage: ${isMongoConnected ? 'MongoDB' : 'In-Memory'}`);
            console.log(`Server URL: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
}

// Start the server
startServer();

// Handle clean shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    if (isMongoConnected) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
    process.exit(0);
});

module.exports = app;