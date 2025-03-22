// api-config.js
const SERVER_URL = 'https://chatbot-njg2.onrender.com';

// Core API endpoints
const API_URL = SERVER_URL;

// Appointments API endpoints
const APPOINTMENTS_API_URL = `${SERVER_URL}/api/appointments`;
const APPOINTMENT_SLOTS_URL = `${SERVER_URL}/api/appointments/slots`;
const APPOINTMENT_REFRESH_URL = `${SERVER_URL}/api/appointments/slots/refresh`;
const APPOINTMENT_VERIFY_URL = `${SERVER_URL}/api/appointments/verify`;
const APPOINTMENT_CANCEL_URL = `${SERVER_URL}/api/appointments/cancel`;

// Admin API endpoints
const ADMIN_BASE_URL = `${SERVER_URL}/api/admin`;
const ADMIN_CONVERSATIONS_URL = `${SERVER_URL}/api/admin/conversations`;

// Chat API endpoint
const CHAT_API_URL = `${SERVER_URL}/chat`;

// Health check endpoint
const HEALTH_CHECK_URL = `${SERVER_URL}/health`;