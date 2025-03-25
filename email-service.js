const nodemailer = require('nodemailer');
const { 
  getConfirmationEmailHtml, 
  getCancellationEmailHtml 
} = require('./email-templates');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    try {
      // Check if email is enabled
      if (process.env.EMAIL_ENABLED !== 'true') {
        console.warn('Email sending is disabled');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        // Improved error handling
        connectionTimeout: 10000,
        socketTimeout: 10000
      });

      // Verify connection
      this.transporter.verify((error) => {
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
    } catch (error) {
      console.error('Error setting up email transporter:', error);
    }
  }

  // Send email method
  async sendEmail(options) {
    if (!this.transporter) {
      this.initializeTransporter();
    }

    if (process.env.EMAIL_ENABLED !== 'true') {
      console.log('Email sending is disabled');
      return false;
    }

    try {
      const defaultOptions = {
        from: `"TransformAI" <${process.env.EMAIL_FROM || 'appointments@transform-ai-solutions.com'}>`,
      };

      const mailOptions = { ...defaultOptions, ...options };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', {
        messageId: info.messageId,
        recipient: mailOptions.to
      });

      return true;
    } catch (error) {
      console.error('Error sending email:', {
        message: error.message,
        recipient: options.to,
        subject: options.subject
      });
      return false;
    }
  }

  // Send confirmation email
  async sendConfirmationEmail(appointment) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    
    return this.sendEmail({
      to: appointment.email,
      subject: 'Your Appointment Confirmation - TransformAI',
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
    });
  }

  // Send cancellation email
  async sendCancellationEmail(appointment) {
    return this.sendEmail({
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
    });
  }

  // Send admin notification
  async sendAdminNotification(subject, details) {
    // Check if admin email is configured
    if (!process.env.ADMIN_EMAIL) {
      console.warn('No admin email configured for notifications');
      return false;
    }

    return this.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Admin Notification: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Admin Notification: ${subject}</h2>
          <pre>${JSON.stringify(details, null, 2)}</pre>
        </div>
      `,
      text: `
        Admin Notification: ${subject}
        
        Details:
        ${JSON.stringify(details, null, 2)}
      `
    });
  }
}

// Export a singleton instance
module.exports = new EmailService();