// email-templates.js - Email templates for appointment system
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
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 5px;
            }
            .header {
                background: linear-gradient(135deg, #FF8A00 0%, #00B2DB 100%);
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
                background-color: #FF3A30;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                margin-top: 15px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #888;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Confirmed</h1>
            </div>
            <div class="content">
                <p>Hello ${appointment.name},</p>
                
                <p>Your appointment with TransformAI has been confirmed. Here are the details:</p>
                
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
                
                <p>If you need to cancel or reschedule, please click the button below:</p>
                
                <a href="${cancellationLink}" class="button">Cancel Appointment</a>
                
                <p>We look forward to meeting with you!</p>
                
                <p>Best regards,<br>TransformAI Team</p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} TransformAI. All rights reserved.</p>
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
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #e0e0e0;
                border-radius: 5px;
            }
            .header {
                background-color: #FF3A30;
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
                text-decoration: line-through;
                color: #888;
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
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #888;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Cancelled</h1>
            </div>
            <div class="content">
                <p>Hello ${appointment.name},</p>
                
                <p>Your appointment with TransformAI has been cancelled. Here are the details of the cancelled appointment:</p>
                
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
                
                <p>If you'd like to schedule a new appointment, please visit our website:</p>
                
                <a href="https://transform-ai-solutions.com/booking" class="button">Book New Appointment</a>
                
                <p>Thank you for your understanding.</p>
                
                <p>Best regards,<br>TransformAI Team</p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} TransformAI. All rights reserved.</p>
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