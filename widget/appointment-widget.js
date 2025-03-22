/**
 * TransformAI Appointment Widget
 * Version: 1.0.1
 * 
 * This script creates a button that opens a new tab for booking appointments
 * with the TransformAI Solutions team.
 * 
 * Usage: 
 * <script src="https://chatbot-njg2.onrender.com/appointment-widget.js" 
 *         data-server-url="https://chatbot-njg2.onrender.com"
 *         data-button-text="Book a Meeting"
 *         data-button-position="right"></script>
 */

(function() {
    // Configuration from script attributes
    const script = document.currentScript;
    const SERVER_URL = script.getAttribute('data-server-url') || 'https://chatbot-njg2.onrender.com';
    const BUTTON_TEXT = script.getAttribute('data-button-text') || 'Book a Meeting';
    const BUTTON_POSITION = script.getAttribute('data-button-position') || 'right'; // 'left', 'right', 'center'
    const BUTTON_COLOR = script.getAttribute('data-button-color') || '#00B2DB'; 
    
    // Create and inject CSS
    const injectStyles = () => {
      const styleEl = document.createElement('style');
      styleEl.innerHTML = `
        /* TransformAI Appointment Widget Styles */
        #transform-ai-appointment-container {
          position: fixed;
          ${BUTTON_POSITION === 'right' ? 'right: 20px;' : BUTTON_POSITION === 'left' ? 'left: 20px;' : 'left: 50%; transform: translateX(-50%);'}
          bottom: ${document.getElementById('transform-ai-chat-container') ? '90px' : '20px'};
          z-index: 999;
        }
        
        #transform-ai-appointment-button {
          background-color: ${BUTTON_COLOR};
          color: white;
          border: none;
          border-radius: 30px;
          padding: 10px 20px;
          font-family: 'Arial', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
        
        #transform-ai-appointment-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        #transform-ai-appointment-button .icon {
          width: 18px;
          height: 18px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          #transform-ai-appointment-container {
            bottom: 20px;
            ${BUTTON_POSITION === 'right' ? 'right: 10px;' : BUTTON_POSITION === 'left' ? 'left: 10px;' : 'left: 50%; transform: translateX(-50%);'}
          }
          
          #transform-ai-appointment-button {
            padding: 8px 16px;
            font-size: 13px;
          }
        }
      `;
      document.head.appendChild(styleEl);
    };
  
    // Create and inject HTML
    const injectHTML = () => {
      const container = document.createElement('div');
      container.id = 'transform-ai-appointment-container';
      
      container.innerHTML = `
        <button id="transform-ai-appointment-button">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${BUTTON_TEXT}
        </button>
      `;
      
      document.body.appendChild(container);
    };
  
    // Initialize the appointment button functionality
    const initAppointment = () => {
      const appointmentButton = document.getElementById('transform-ai-appointment-button');
      
      appointmentButton.addEventListener('click', () => {
        // Open booking page in a new tab using _blank
        window.open(`${SERVER_URL}/booking.html`, '_blank');
      });
    };
  
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        injectStyles();
        injectHTML();
        initAppointment();
      });
    } else {
      injectStyles();
      injectHTML();
      initAppointment();
    }
  })();