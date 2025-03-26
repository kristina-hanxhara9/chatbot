// email-templates.js - Professional email templates for appointment system
const path = require('path');

// Generate a cancellation link with a secure token
function generateCancellationLink(baseUrl, appointmentId, token) {
    // Make sure we're using the full server URL for the cancellation link
    return `${baseUrl}/cancel-appointment.html?id=${appointmentId}&token=${token}`;
}

// Confirmation email template
function getConfirmationEmailHtml(appointment, baseUrl) {
    const cancellationLink = generateCancellationLink(
        baseUrl, 
        appointment.id, 
        appointment.cancellationToken
    );

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmation</title>
        <style>
            body {
                font-family: 'Arial', 'Helvetica', sans-serif;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
                font-size: 16px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 5px;
            }
            .header {
                background-color: #ff4a17;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
            }
            .logo-container {
                text-align: center;
                background-color: white;
                padding: 20px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            .logo {
                max-width: 200px;
                height: auto;
            }
            .content {
                padding: 20px;
                font-size: 16px;
            }
            .content p {
                margin-bottom: 16px;
                font-size: 16px;
            }
            .greeting {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px;
            }
            .appointment-details {
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
                border: 1px solid #e0e0e0;
                font-size: 16px;
            }
            .detail-row {
                margin-bottom: 12px;
                line-height: 1.5;
            }
            .label {
                font-weight: bold;
                margin-right: 5px;
                font-size: 16px;
                color: #555555;
            }
            .value {
                font-size: 16px;
                font-weight: 500;
            }
            .button-container {
                text-align: center;
                margin: 25px 0;
            }
            .button {
                display: inline-block;
                background-color: #ff4a17;
                color: white;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 16px;
                letter-spacing: 0.5px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #888888;
                font-size: 14px;
            }
            .signature {
                margin-top: 20px;
                font-weight: 600;
                font-size: 16px;
            }
            .company-name {
                font-weight: 700;
                color: #ff4a17;
            }
            .social {
                margin-top: 15px;
            }
            .social a {
                display: inline-block;
                margin: 0 10px;
                color: #ff4a17;
                text-decoration: none;
                font-weight: 600;
            }
            .disclaimer {
                margin-top: 15px;
                font-size: 12px;
                color: #999999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Confirmation</h1>
            </div>
            
            <div class="logo-container">
                <!-- Replace with your actual logo URL -->
                <img src="./images/bg-removed.webp" alt="TransformAI Logo" class="logo">
            </div>
            
            <div class="content">
                <p class="greeting">Dear ${appointment.name},</p>
                
                <p>Thank you for scheduling an appointment with TransformAI. We have confirmed your appointment details below:</p>
                
                <div class="appointment-details">
                    <div class="detail-row">
                        <span class="label">Date:</span> 
                        <span class="value">${appointment.formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Time:</span> 
                        <span class="value">${appointment.formattedTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Topic:</span> 
                        <span class="value">${appointment.topic || 'Not specified'}</span>
                    </div>
                </div>
                
                <p>If you need to cancel or reschedule your appointment, please use the secure link below:</p>
                
                <div class="button-container">
                    <a href="${cancellationLink}" class="button">Manage Appointment</a>
                </div>
                
                <p>If you have any questions before your appointment, please don't hesitate to contact our support team at <a href="mailto:support@transform-ai-solutions.com" style="color: #ff4a17; font-weight: 600;">support@transform-ai-solutions.com</a>.</p>
                
                <p>We look forward to meeting with you!</p>
                
                <p class="signature">Best regards,<br><span class="company-name">TransformAI Team</span></p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} TransformAI. All rights reserved.</p>
                <p>TransformAI Solutions Inc., 123 Tech Avenue, San Francisco, CA 94103</p>
                <div class="social">
                    <a href="https://twitter.com/transformai">Twitter</a> | 
                    <a href="https://linkedin.com/company/transformai">LinkedIn</a> | 
                    <a href="https://transform-ai-solutions.onrender.com">Website</a>
                </div>
                <p class="disclaimer">This is a transactional email related to your appointment with TransformAI.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Cancellation email template
function getCancellationEmailHtml(appointment) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Cancelled</title>
        <style>
            body {
                font-family: 'Arial', 'Helvetica', sans-serif;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
                font-size: 16px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 5px;
            }
            .header {
                background-color: #555555;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
            }
            .logo-container {
                text-align: center;
                background-color: white;
                padding: 20px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            .logo {
                max-width: 200px;
                height: auto;
            }
            .content {
                padding: 20px;
                font-size: 16px;
            }
            .content p {
                margin-bottom: 16px;
                font-size: 16px;
            }
            .greeting {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px;
            }
            .appointment-details {
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
                border: 1px solid #e0e0e0;
                color: #777777;
                font-size: 16px;
            }
            .detail-row {
                margin-bottom: 12px;
                line-height: 1.5;
            }
            .label {
                font-weight: bold;
                margin-right: 5px;
                font-size: 16px;
                color: #555555;
            }
            .value {
                font-size: 16px;
                font-weight: 500;
            }
            .button-container {
                text-align: center;
                margin: 25px 0;
            }
            .button {
                display: inline-block;
                background-color: #ff4a17;
                color: white;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 16px;
                letter-spacing: 0.5px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #888888;
                font-size: 14px;
            }
            .signature {
                margin-top: 20px;
                font-weight: 600;
                font-size: 16px;
            }
            .company-name {
                font-weight: 700;
                color: #ff4a17;
            }
            .social {
                margin-top: 15px;
            }
            .social a {
                display: inline-block;
                margin: 0 10px;
                color: #ff4a17;
                text-decoration: none;
                font-weight: 600;
            }
            .disclaimer {
                margin-top: 15px;
                font-size: 12px;
                color: #999999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Cancelled</h1>
            </div>
            
            <div class="logo-container">
                <!-- Replace with your actual logo URL -->
                <img src="./images/bg-removed.webp" alt="TransformAI Logo" class="logo">
            </div>
            
            <div class="content">
                <p class="greeting">Dear ${appointment.name},</p>
                
                <p>We confirm that your appointment with TransformAI has been cancelled. Here are the details of the cancelled appointment:</p>
                
                <div class="appointment-details">
                    <div class="detail-row">
                        <span class="label">Date:</span> 
                        <span class="value">${appointment.formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Time:</span> 
                        <span class="value">${appointment.formattedTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Topic:</span> 
                        <span class="value">${appointment.topic || 'Not specified'}</span>
                    </div>
                </div>
                
                <p>Would you like to schedule a new appointment? You can do so by visiting our booking page:</p>
                
                <div class="button-container">
                    <a href="https://transform-ai-solutions.onrender.com/booking.html" class="button">Schedule New Appointment</a>
                </div>
                
                <p>If you have any questions, please contact our support team at <a href="mailto:support@transform-ai-solutions.com" style="color: #ff4a17; font-weight: 600;">support@transform-ai-solutions.com</a>.</p>
                
                <p>Thank you for your understanding.</p>
                
                <p class="signature">Best regards,<br><span class="company-name">TransformAI Team</span></p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} TransformAI. All rights reserved.</p>
                <p>TransformAI Solutions Inc., 123 Tech Avenue, San Francisco, CA 94103</p>
                <div class="social">
                    <a href="https://twitter.com/transformai">Twitter</a> | 
                    <a href="https://linkedin.com/company/transformai">LinkedIn</a> | 
                    <a href="https://transform-ai-solutions.onrender.com">Website</a>
                </div>
                <p class="disclaimer">This is a transactional email related to your appointment with TransformAI.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

module.exports = {
    getConfirmationEmailHtml,
    getCancellationEmailHtml,
    generateCancellationLink
};