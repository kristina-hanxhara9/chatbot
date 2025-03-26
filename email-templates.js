// email-templates.js - Professional email templates for appointment system
const path = require('path');

// Generate a cancellation link with a secure token
function generateCancellationLink(baseUrl, appointmentId, token) {
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
                background-color: #00B2DB;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }
            .content {
                padding: 20px;
            }
            .appointment-details {
                background-color: #f9f9f9;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border: 1px solid #e0e0e0;
            }
            .detail-row {
                margin-bottom: 10px;
            }
            .label {
                font-weight: bold;
                margin-right: 5px;
            }
            .button {
                display: inline-block;
                background-color: #00B2DB;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                margin-top: 15px;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #888888;
                font-size: 14px;
            }
            .logo {
                text-align: center;
                margin-bottom: 20px;
            }
            .social {
                margin-top: 15px;
            }
            .social a {
                display: inline-block;
                margin: 0 10px;
                color: #00B2DB;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Confirmation</h1>
            </div>
            <div class="content">
                <p>Dear ${appointment.name},</p>
                
                <p>Thank you for scheduling an appointment with TransformAI. We have confirmed your appointment details below:</p>
                
                <div class="appointment-details">
                    <div class="detail-row">
                        <span class="label">Date:</span> 
                        <span>${appointment.formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Time:</span> 
                        <span>${appointment.formattedTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Topic:</span> 
                        <span>${appointment.topic || 'Not specified'}</span>
                    </div>
                </div>
                
                <p>If you need to cancel or reschedule your appointment, please use the secure link below:</p>
                
                <div style="text-align: center;">
                    <a href="${cancellationLink}" class="button">Manage Appointment</a>
                </div>
                
                <p>If you have any questions before your appointment, please don't hesitate to contact our support team at <a href="mailto:support@transform-ai-solutions.com">support@transform-ai-solutions.com</a>.</p>
                
                <p>We look forward to meeting with you!</p>
                
                <p>Best regards,<br>TransformAI Team</p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} TransformAI. All rights reserved.</p>
                <p>TransformAI Solutions Inc., 123 Tech Avenue, San Francisco, CA 94103</p>
                <div class="social">
                    <a href="https://twitter.com/transformai">Twitter</a> | 
                    <a href="https://linkedin.com/company/transformai">LinkedIn</a> | 
                    <a href="https://transform-ai-solutions.com">Website</a>
                </div>
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
            .content {
                padding: 20px;
            }
            .appointment-details {
                background-color: #f9f9f9;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border: 1px solid #e0e0e0;
                color: #777777;
            }
            .detail-row {
                margin-bottom: 10px;
            }
            .label {
                font-weight: bold;
                margin-right: 5px;
            }
            .button {
                display: inline-block;
                background-color: #00B2DB;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                margin-top: 15px;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #888888;
                font-size: 14px;
            }
            .logo {
                text-align: center;
                margin-bottom: 20px;
            }
            .social {
                margin-top: 15px;
            }
            .social a {
                display: inline-block;
                margin: 0 10px;
                color: #00B2DB;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Cancelled</h1>
            </div>
            <div class="content">
                <p>Dear ${appointment.name},</p>
                
                <p>We confirm that your appointment with TransformAI has been cancelled. Here are the details of the cancelled appointment:</p>
                
                <div class="appointment-details">
                    <div class="detail-row">
                        <span class="label">Date:</span> 
                        <span>${appointment.formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Time:</span> 
                        <span>${appointment.formattedTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Topic:</span> 
                        <span>${appointment.topic || 'Not specified'}</span>
                    </div>
                </div>
                
                <p>Would you like to schedule a new appointment? You can do so by visiting our booking page:</p>
                
                <div style="text-align: center;">
                    <a href="https://transform-ai-solutions.com/booking" class="button">Schedule New Appointment</a>
                </div>
                
                <p>If you have any questions, please contact our support team at <a href="mailto:support@transform-ai-solutions.com">support@transform-ai-solutions.com</a>.</p>
                
                <p>Thank you for your understanding.</p>
                
                <p>Best regards,<br>TransformAI Team</p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} TransformAI. All rights reserved.</p>
                <p>TransformAI Solutions Inc., 123 Tech Avenue, San Francisco, CA 94103</p>
                <div class="social">
                    <a href="https://twitter.com/transformai">Twitter</a> | 
                    <a href="https://linkedin.com/company/transformai">LinkedIn</a> | 
                    <a href="https://transform-ai-solutions.com">Website</a>
                </div>
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