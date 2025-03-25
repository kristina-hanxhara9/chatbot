const nodemailer = require('nodemailer');
const { 
  getConfirmationEmailHtml, 
  getCancellationEmailHtml 
} = require('./email-templates');

// Create email transporter
const createEmailTransporter = () => {
  // Check if email is enabled
  if (process.env.EMAIL_ENABLED !== 'true') {
    console.warn('Email sending is disabled');
    return null;
  }

  // Create transporter with robust configuration
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Improved error handling and logging
    logger: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',
    
    // Connection and socket timeouts
    connectionTimeout: 10000,
    socketTimeout: 10000,

    // TLS configuration
    tls: {
      // Do not fail on invalid certificates in production
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });

  // Verify transporter connection
  transporter.verify((error) => {
    if (error) {
      console.error('SMTP Connection Error:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
    } else {
      console.log('SMTP Server is ready to send emails');
    }
  });

  return transporter;
};

// Send email utility function
const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = createEmailTransporter();
    
    if (!transporter) {
      throw new Error('Email transporter not configured');
    }

    // Default from email if not provided
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM,
      ...options
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      recipient: mailOptions.to,
      date: new Date().toISOString()
    });

    return info;
  } catch (error) {
    console.error('Error sending email:', {
      message: error.message,
      recipient: options.to,
      subject: options.subject
    });

    // Additional error details
    if (error.responseCode) {
      console.error('SMTP Response Code:', error.responseCode);
    }
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }

    throw error;
  }
};

// Send confirmation email
const sendConfirmationEmail = async (appointment) => {
  // Validate required inputs
  if (!appointment || !appointment.email) {
    throw new Error('Invalid appointment details');
  }

  // Check if email is enabled
  if (process.env.EMAIL_ENABLED !== 'true') {
    console.log('Email sending is disabled');
    return false;
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

  // Prepare email options
  const mailOptions = {
    to: appointment.email,
    subject: 'Appointment Confirmation - TransformAI',
    html: getConfirmationEmailHtml(appointment, baseUrl),
    text: `
      Appointment Confirmation

      Hello ${appointment.name},

      Your appointment is confirmed:
      Date: ${appointment.formattedDate}
      Time: ${appointment.formattedTime}
      Topic: ${appointment.topic || 'Not specified'}

      To cancel or reschedule, please visit: 
      ${baseUrl}/cancel-appointment
      
      Best regards,
      TransformAI Team
    `
  };

  try {
    await sendEmail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
};

// Send cancellation email
const sendCancellationEmail = async (appointment) => {
  // Validate required inputs
  if (!appointment || !appointment.email) {
    throw new Error('Invalid appointment details');
  }

  // Check if email is enabled
  if (process.env.EMAIL_ENABLED !== 'true') {
    console.log('Email sending is disabled');
    return false;
  }

  // Prepare email options
  const mailOptions = {
    to: appointment.email,
    subject: 'Appointment Cancelled - TransformAI',
    html: getCancellationEmailHtml(appointment),
    text: `
      Appointment Cancellation

      Hello ${appointment.name},

      Your appointment has been cancelled:
      Date: ${appointment.formattedDate}
      Time: ${appointment.formattedTime}
      Topic: ${appointment.topic || 'Not specified'}

      To schedule a new appointment, please visit:
      https://transform-ai-solutions.com/booking

      Best regards,
      TransformAI Team
    `
  };

  try {
    await sendEmail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
    return false;
  }
};

// Send admin notification
const sendAdminNotification = async (notificationType, details) => {
  // Check if email is enabled and admin email is set
  if (process.env.EMAIL_ENABLED !== 'true' || !process.env.ADMIN_EMAIL) {
    console.log('Admin notification is disabled');
    return false;
  }

  // Prepare email options
  const mailOptions = {
    to: process.env.ADMIN_EMAIL,
    subject: `Admin Notification: ${notificationType}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Admin Notification: ${notificationType}</h2>
        <pre>${JSON.stringify(details, null, 2)}</pre>
      </div>
    `,
    text: `
      Admin Notification: ${notificationType}
      
      Details:
      ${JSON.stringify(details, null, 2)}
    `
  };

  try {
    await sendEmail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return false;
  }
};

module.exports = {
  createEmailTransporter,
  sendEmail,
  sendConfirmationEmail,
  sendCancellationEmail,
  sendAdminNotification
};