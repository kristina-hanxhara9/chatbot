/**
 * TransformAI Chat Widget - Mobile Responsive Version
 * Version: 1.1.0
 * 
 * This script creates a floating chat widget that connects to
 * the TransformAI Solutions chatbot backend, with enhanced mobile support.
 * 
 * Usage: 
 * <script src="https://chatbot-njg2.onrender.com/transform-ai-widget.js" 
 *         data-server-url="https://chatbot-njg2.onrender.com"></script>
 */

(function() {
  // Configuration
  const script = document.currentScript;
  const SERVER_URL = script.getAttribute('data-server-url') || 'https://chatbot-njg2.onrender.com';
  
  // Create and inject meta tags for mobile
  const injectMetaTags = () => {
    // Check if viewport meta tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      document.head.appendChild(viewportMeta);
    }
    
    // Add other mobile-friendly meta tags
    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'theme-color', content: '#00B2DB' }
    ];
    
    metaTags.forEach(meta => {
      if (!document.querySelector(`meta[name="${meta.name}"]`)) {
        const metaTag = document.createElement('meta');
        metaTag.setAttribute('name', meta.name);
        metaTag.setAttribute('content', meta.content);
        document.head.appendChild(metaTag);
      }
    });
  };
  
  // Create and inject CSS
  const injectStyles = () => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      /* Reset and Global Styles */
      #transform-ai-chat-container * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Arial', sans-serif;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow-x: hidden;
      }
      
      /* Ensure proper viewport setup */
      @viewport {
        width: device-width;
        zoom: 1.0;
      }
      
      /* Chat Widget Styles */
      #transform-ai-chat-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      }
      
      /* Chat Button */
      #transform-ai-chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF8A00 0%, #00B2DB 100%);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
      }
      
      #transform-ai-chat-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
      }
      
      #transform-ai-chat-button .icon {
        height: 28px;
        width: auto;
        display: block;
        margin: auto;
      }
      
      /* Chat Window */
      #transform-ai-chat-window {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 350px;
        height: 500px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
        overflow: hidden;
        display: none;
        flex-direction: column;
        animation: transform-ai-slide-up 0.3s ease forwards;
        border: 1px solid #e0e0e0;
      }
      
      @keyframes transform-ai-slide-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Chat Header */
      #transform-ai-chat-header {
        background: linear-gradient(135deg, #FF8A00 0%, #00B2DB 100%);
        color: white;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      #transform-ai-chat-header h3 {
        font-size: 16px;
        font-weight: 600;
      }
      
      #transform-ai-close-chat-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
      }
      
      /* Chat Messages */
      #transform-ai-chat-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
        background-color: #f9f9f9;
      }
      
      .transform-ai-message {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.4;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      .transform-ai-message.bot {
        align-self: flex-start;
        background-color: white;
        color: #333;
        border-bottom-left-radius: 5px;
        border-left: 3px solid #00B2DB;
      }
      
      .transform-ai-message.user {
        align-self: flex-end;
        background: linear-gradient(135deg, #0062cc 0%, #00B2DB 100%);
        color: white;
        border-bottom-right-radius: 5px;
      }
      
      /* Welcome Message */
      .transform-ai-welcome-container {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 5px;
      }
      
      .transform-ai-bot-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF8A00 0%, #00B2DB 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        flex-shrink: 0;
      }
      
      .transform-ai-welcome-message-container {
        flex: 1;
      }
      
      .transform-ai-welcome-heading {
        font-weight: 600;
        margin-bottom: 4px;
        color: #333;
      }
      
      /* Options Buttons */
      .transform-ai-options-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      
      .transform-ai-option-button {
        background-color: white;
        border: 1px solid #e4e6eb;
        border-radius: 18px;
        padding: 8px 12px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        color: #0062cc;
      }
      
      .transform-ai-option-button:hover {
        background-color: #f0f7ff;
        border-color: #00B2DB;
        transform: translateY(-1px);
      }
      
      /* Chat Input */
      #transform-ai-chat-input-container {
        padding: 15px;
        border-top: 1px solid #e4e6eb;
        background-color: white;
      }
      
      #transform-ai-chat-form {
        display: flex;
        gap: 10px;
      }
      
      #transform-ai-chat-input {
        flex: 1;
        padding: 12px 15px;
        border: 1px solid #e4e6eb;
        border-radius: 20px;
        outline: none;
        font-size: 14px;
        transition: border-color 0.2s;
      }
      
      #transform-ai-chat-input:focus {
        border-color: #00B2DB;
        box-shadow: 0 0 0 2px rgba(0, 178, 219, 0.1);
      }
      
      #transform-ai-send-button {
        background: linear-gradient(135deg, #FF8A00 0%, #00B2DB 100%);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        color: white;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.2s;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
      
      #transform-ai-send-button:hover {
        transform: scale(1.05);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
      }
      
      /* Typing Indicator */
      .transform-ai-typing-container {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 15px;
      }
      
      .transform-ai-typing-indicator {
        display: inline-flex;
        align-items: center;
        background-color: white;
        padding: 12px 16px;
        border-radius: 18px;
        border-bottom-left-radius: 5px;
        border-left: 3px solid #00B2DB;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      .transform-ai-typing-dot {
        width: 8px;
        height: 8px;
        margin: 0 2px;
        background-color: #00B2DB;
        border-radius: 50%;
        opacity: 0.6;
        animation: transform-ai-typing-animation 1.4s infinite both;
      }
      
      .transform-ai-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
        background-color: #0062cc;
      }
      
      .transform-ai-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
        background-color: #FF8A00;
      }
      
      @keyframes transform-ai-typing-animation {
        0% {
          opacity: 0.6;
          transform: scale(1);
        }
        50% {
          opacity: 1;
          transform: scale(1.2);
        }
        100% {
          opacity: 0.6;
          transform: scale(1);
        }
      }
      
      #transform-ai-error-message {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
        text-align: center;
      }
      
      #transform-ai-connection-status {
        font-size: 12px;
        text-align: center;
        padding: 5px;
        border-top: 1px solid #e4e6eb;
        color: #666;
      }
      
      .transform-ai-powered-by {
        font-size: 11px;
        text-align: center;
        padding: 4px;
        color: #999;
        background-color: #f9f9f9;
        border-top: 1px solid #eee;
      }
      
      /* Booking UI Components */
      .transform-ai-booking-steps {
        display: flex;
        justify-content: space-between;
        background-color: #f3f7fa;
        border-radius: 10px;
        padding: 8px;
        margin-top: 10px;
        margin-bottom: 5px;
      }
      
      .transform-ai-booking-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 11px;
        color: #888;
        position: relative;
        flex: 1;
      }
      
      .transform-ai-booking-step.active {
        color: #00B2DB;
        font-weight: 500;
      }
      
      .transform-ai-booking-step.completed {
        color: #FF8A00;
      }
      
      .transform-ai-step-number {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
        font-size: 10px;
        font-weight: bold;
        color: #999;
      }
      
      .transform-ai-booking-step.active .transform-ai-step-number {
        background-color: #00B2DB;
        color: white;
      }
      
      .transform-ai-booking-step.completed .transform-ai-step-number {
        background-color: #FF8A00;
        color: white;
      }
      
      .transform-ai-date-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-top: 8px;
      }
      
      .transform-ai-date-option {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 10px 8px;
        text-align: center;
        cursor: pointer;
        background-color: white;
        font-size: 12px;
        transition: all 0.2s;
      }
      
      .transform-ai-date-option:hover {
        border-color: #00B2DB;
        background-color: #f0f7fa;
      }
      
      .transform-ai-date-option.selected {
        border-color: #00B2DB;
        background-color: #f0f7fa;
      }
      
      .transform-ai-time-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-top: 8px;
      }
      
      .transform-ai-time-option {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 10px 8px;
        text-align: center;
        cursor: pointer;
        background-color: white;
        font-size: 13px;
        transition: all 0.2s;
      }
      
      .transform-ai-time-option:hover {
        border-color: #00B2DB;
        background-color: #f0f7fa;
      }
      
      .transform-ai-time-option.selected {
        border-color: #00B2DB;
        background-color: #f0f7fa;
      }
      
      /* Enhanced Mobile Responsiveness */
      @media (max-width: 768px) {
        /* Chat window - tablet size */
        #transform-ai-chat-window {
          width: 85%;
          max-width: 400px;
          height: 500px;
          right: 10px;
          bottom: 80px;
        }
        
        /* Input container adjustments */
        #transform-ai-chat-input-container {
          padding: 10px;
        }
        
        /* Input field adjustments */
        #transform-ai-chat-input {
          font-size: 16px; /* Prevents zoom on mobile when focusing */
        }
      }
      
      @media (max-width: 480px) {
        /* Chat window - mobile size */
        #transform-ai-chat-window {
          width: 92%;
          height: 70vh; /* Use viewport height */
          max-height: 600px;
          right: 4%;
          left: 4%;
          bottom: 80px;
        }
        
        /* Chat button position */
        #transform-ai-chat-button {
          right: 10px;
          bottom: 10px;
        }
        
        /* Header adjustments */
        #transform-ai-chat-header {
          padding: 10px 15px;
        }
        
        /* Messages container */
        #transform-ai-chat-messages {
          padding: 10px;
        }
        
        /* Message bubbles */
        .transform-ai-message {
          max-width: 85%;
          padding: 10px 12px;
          font-size: 14px;
        }
        
        /* Option buttons container */
        .transform-ai-options-container {
          flex-wrap: wrap;
          justify-content: center;
        }
        
        /* Option buttons */
        .transform-ai-option-button {
          margin: 3px;
          padding: 8px 10px;
          font-size: 12px;
        }
        
        /* Date and time grids for booking */
        .transform-ai-date-grid,
        .transform-ai-time-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        /* Input container - stick to bottom */
        #transform-ai-chat-input-container {
          position: sticky;
          bottom: 0;
          background: white;
          z-index: 5;
          padding: 8px 10px;
        }
        
        /* Input adjustments for mobile */
        #transform-ai-chat-input {
          padding: 10px;
          font-size: 16px; /* Prevents zoom on mobile */
        }
        
        /* Send button adjustments */
        #transform-ai-send-button {
          width: 36px;
          height: 36px;
        }
        
        /* Welcome message container adjustments */
        .transform-ai-welcome-container {
          flex-direction: column;
          align-items: center;
        }
        
        /* Bot avatar position on mobile */
        .transform-ai-bot-avatar {
          margin-bottom: 5px;
        }
        
        /* Typing indicator positioning */
        .transform-ai-typing-container {
          align-items: center;
        }
        
        /* Booking UI adjustments */
        .transform-ai-booking-steps {
          padding: 5px;
        }
        
        .transform-ai-booking-step {
          font-size: 10px;
        }
        
        .transform-ai-step-number {
          width: 18px;
          height: 18px;
        }
      }
      
      /* Very small screens - full screen chat */
      @media (max-width: 350px) {
        #transform-ai-chat-window {
          width: 100%;
          height: 100vh;
          bottom: 0;
          right: 0;
          left: 0;
          border-radius: 0;
        }
        
        #transform-ai-chat-button {
          bottom: 10px;
          right: 10px;
        }
      }
      
      /* Fix touch behavior on iOS */
      @media (pointer: coarse) {
        #transform-ai-chat-input,
        .transform-ai-option-button,
        #transform-ai-send-button,
        .transform-ai-date-option,
        .transform-ai-time-option {
          cursor: pointer;
          -webkit-tap-highlight-color: rgba(0,0,0,0);
          touch-action: manipulation;
        }
        
        /* Prevent double-tap zoom */
        * {
          touch-action: manipulation;
        }
      }
      
      /* Fix for notched phones */
      @supports (padding-bottom: env(safe-area-inset-bottom)) {
        #transform-ai-chat-container {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        #transform-ai-chat-input-container {
          padding-bottom: calc(15px + env(safe-area-inset-bottom));
        }
      }
      
      /* Use CSS custom property for vh units to fix iOS Safari issues */
      :root {
        --vh: 1vh;
      }
      
      @media (max-width: 480px) {
        #transform-ai-chat-window {
          height: calc(var(--vh, 1vh) * 70);
        }
      }
      
      @media (max-width: 350px) {
        #transform-ai-chat-window {
          height: calc(var(--vh, 1vh) * 100);
        }
      }
    `;
    document.head.appendChild(styleEl);
  };

  // Create and inject HTML
  const injectHTML = () => {
    const container = document.createElement('div');
    container.id = 'transform-ai-chat-container';
    
    container.innerHTML = `
      <div id="transform-ai-chat-button">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div id="transform-ai-chat-window">
        <div id="transform-ai-chat-header">
          <h3>Transform AI Assistant</h3>
          <button id="transform-ai-close-chat-btn">&times;</button>
        </div>
        <div id="transform-ai-chat-messages">
          <div class="transform-ai-welcome-container">
            <div class="transform-ai-bot-avatar">🤖</div>
            <div class="transform-ai-welcome-message-container">
              <div class="transform-ai-welcome-heading">Transform AI Solutions</div>
              <div class="transform-ai-message bot">
                Hello! I'm your AI assistant from Transform AI Solutions. How can I help make AI work for your business today?
              </div>
              <div class="transform-ai-options-container">
                <button class="transform-ai-option-button">Our services</button>
                <button class="transform-ai-option-button">Chatbot solutions</button>
                <button class="transform-ai-option-button">AI agents</button>
                <button class="transform-ai-option-button">Book a meeting</button>
              </div>
            </div>
          </div>
        </div>
        <div id="transform-ai-connection-status">Connecting to assistant...</div>
        <div id="transform-ai-chat-input-container">
          <form id="transform-ai-chat-form">
            <input type="text" id="transform-ai-chat-input" placeholder="Type your message here..." autocomplete="off" />
            <button type="submit" id="transform-ai-send-button" title="Send message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </form>
          <div id="transform-ai-error-message"></div>
        </div>
        <div class="transform-ai-powered-by">Powered by Transform AI Solutions</div>
      </div>
    `;
    
    document.body.appendChild(container);
  };

  // Fix for iOS vh units
  const fixIOSViewportHeight = () => {
    // First we get the viewport height and multiply it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // We listen to the resize event and orientation change
    window.addEventListener('resize', () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
    
    window.addEventListener('orientationchange', () => {
      // Add slight delay to ensure accurate height after orientation change
      setTimeout(() => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }, 100);
    });
  };

  // Fix for iOS elastic scrolling
  const fixIOSScrolling = () => {
    document.addEventListener('touchmove', function(event) {
      if (event.target.closest('#transform-ai-chat-messages')) {
        // Allow scrolling in message container, but prevent bounce
        const target = event.target.closest('#transform-ai-chat-messages');
        if ((target.scrollTop <= 0 && event.touches[0].screenY > event.touches[0].startY) ||
            (target.scrollHeight - target.scrollTop <= target.clientHeight && 
             event.touches[0].screenY < event.touches[0].startY)) {
          event.preventDefault();
        }
      } else if (event.target.closest('#transform-ai-chat-window') && 
                !event.target.closest('#transform-ai-chat-input')) {
        // Prevent elastic bouncing elsewhere in the chat window
        event.preventDefault();
      }
    }, { passive: false });
  };

  // Initialize the chat functionality
  const initChat = () => {
    // DOM Elements
    const chatButton = document.getElementById('transform-ai-chat-button');
    const chatWindow = document.getElementById('transform-ai-chat-window');
    const closeChatBtn = document.getElementById('transform-ai-close-chat-btn');
    const chatMessages = document.getElementById('transform-ai-chat-messages');
    const chatForm = document.getElementById('transform-ai-chat-form');
    const chatInput = document.getElementById('transform-ai-chat-input');
    const optionButtons = document.querySelectorAll('.transform-ai-option-button');
    const errorMessage = document.getElementById('transform-ai-error-message');
    const connectionStatus = document.getElementById('transform-ai-connection-status');
    
    // Chat state
    let sessionId = localStorage.getItem('transform-ai-session-id') || null;
    let isConnected = false;
    let isBookingFlow = false;
    let currentBookingStep = null;
    
    // Event Listeners
    chatButton.addEventListener('click', openChat);
    closeChatBtn.addEventListener('click', hideChat);
    chatForm.addEventListener('submit', handleSubmit);
    
    // Handle window resize for responsive layout
    window.addEventListener('resize', () => {
      if (chatWindow.style.display === 'flex') {
        adjustChatWindowPosition();
      }
    });
    
    // Setup option buttons
    optionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const buttonText = button.textContent;
        sendMessage(buttonText);
      });
    });
    
    // Functions
    function adjustChatWindowPosition() {
      // Adjust layout for different screen sizes
      if (window.innerWidth <= 350) {
        // Very small screen - full screen chat
        chatWindow.style.width = '100%';
        chatWindow.style.height = `calc(var(--vh, 1vh) * 100)`;
        chatWindow.style.bottom = '0';
        chatWindow.style.right = '0';
        chatWindow.style.left = '0';
        chatWindow.style.borderRadius = '0';
      } else if (window.innerWidth <= 480) {
        // Mobile
        chatWindow.style.width = '92%';
        chatWindow.style.height = `calc(var(--vh, 1vh) * 70)`;
        chatWindow.style.right = '4%';
        chatWindow.style.left = '4%';
        chatWindow.style.bottom = '80px';
        chatWindow.style.borderRadius = '12px';
      } else {
        // Tablet and larger
        chatWindow.style.width = '';
        chatWindow.style.height = '';
        chatWindow.style.right = '';
        chatWindow.style.left = '';
        chatWindow.style.bottom = '';
      }
    }
    
    function openChat() {
      chatWindow.style.display = 'flex';
      chatButton.style.display = 'none';
      chatInput.focus();
      
      // Apply mobile-specific adjustments
      adjustChatWindowPosition();
      
      // Check connection
      if (!isConnected) {
        checkConnection();
      }
    }
    
    function hideChat() {
      chatWindow.style.display = 'none';
      chatButton.style.display = 'flex';
    }
    
    async function checkConnection() {
      connectionStatus.style.display = 'block';
      
      try {
        const response = await fetch(`${SERVER_URL}/health`);
        if (response.ok) {
          isConnected = true;
          connectionStatus.style.display = 'none';
        } else {
          connectionStatus.textContent = 'Could not connect to the assistant. Please try again later.';
        }
      } catch (error) {
        connectionStatus.textContent = 'Network error. Please check your connection.';
      }
    }
    
    function handleSubmit(event) {
      event.preventDefault();
      
      const message = chatInput.value.trim();
      if (!message) return;
      
      // Clear input
      chatInput.value = '';
      
      // Send the message
      sendMessage(message);
    }
    
    function addMessage(text, isUser) {
      const messageContainer = document.createElement('div');
      
      if (isUser) {
        // User message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'transform-ai-message user';
        messageDiv.textContent = text;
        
        messageContainer.appendChild(messageDiv);
      } else {
        // Process bot response to remove any thought process patterns
        text = text
          .replace(/^(Response:|Answer:|Bot:|Assistant:|AI:)/i, '')
          .replace(/^(Thinking:|Analysis:|Let me think:|Here's my thought process:).*?\n\n/is, '')
          .replace(/^[\s\n]*/, '')
          .trim();
        
        // Check if this is a booking message
        if (text.includes('📅') || text.includes('🕒') || 
            text.includes('Would you like to book a meeting') || 
            text.includes('Available Dates:') || 
            text.includes('Available Times for') || 
            text.includes('booking')) {
          handleBookingMessage(text, messageContainer);
        } else {
          // Regular bot message with avatar
          const container = document.createElement('div');
          container.className = 'transform-ai-welcome-container';
          
          const avatarDiv = document.createElement('div');
          avatarDiv.className = 'transform-ai-bot-avatar';
          avatarDiv.textContent = '🤖';
          
          const messageContent = document.createElement('div');
          messageContent.className = 'transform-ai-welcome-message-container';
          
          const messageDiv = document.createElement('div');
          messageDiv.className = 'transform-ai-message bot';
          messageDiv.innerHTML = text.replace(/\n/g, '<br>'); // Support line breaks
          
          // Add option buttons when appropriate
          if (text.includes('?') && !isUser && shouldAddOptions(text)) {
            const optionsDiv = createOptionButtons(text);
            if (optionsDiv) {
              messageContent.appendChild(messageDiv);
              messageContent.appendChild(optionsDiv);
            } else {
              messageContent.appendChild(messageDiv);
            }
          } else {
            messageContent.appendChild(messageDiv);
          }
          
          container.appendChild(avatarDiv);
          container.appendChild(messageContent);
          
          messageContainer.appendChild(container);
        }
      }
      
      chatMessages.appendChild(messageContainer);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to handle booking-related messages
    function handleBookingMessage(text, messageContainer) {
      // Create container with avatar
      const container = document.createElement('div');
      container.className = 'transform-ai-welcome-container';
      
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'transform-ai-bot-avatar';
      avatarDiv.textContent = '🤖';
      
      const messageContent = document.createElement('div');
      messageContent.className = 'transform-ai-welcome-message-container';
      
      const messageDiv = document.createElement('div');
      messageDiv.className = 'transform-ai-message bot';
      
      // Determine booking step
      if (text.includes('Would you like to book a meeting')) {
        isBookingFlow = true;
        currentBookingStep = 'select_day';
        
        // Add booking steps indicator
        const stepsIndicator = createBookingSteps('select_day');
        
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        messageContent.appendChild(messageDiv);
        messageContent.appendChild(stepsIndicator);
      } 
      else if (text.includes('Available Dates:')) {
        currentBookingStep = 'select_date';
        
        // Add booking steps indicator
        const stepsIndicator = createBookingSteps('select_date');
        
        // Parse and create date selection UI
        const dateOptions = parseDateOptions(text);
        
        messageDiv.innerHTML = 'Please select a date:';
        messageContent.appendChild(messageDiv);
        messageContent.appendChild(stepsIndicator);
        
        const dateGrid = document.createElement('div');
        dateGrid.className = 'transform-ai-date-grid';
        
        dateOptions.forEach((dateOption, index) => {
          const dateElement = document.createElement('div');
          dateElement.className = 'transform-ai-date-option';
          dateElement.dataset.index = index + 1;
          dateElement.textContent = dateOption;
          dateElement.addEventListener('click', function() {
            // Remove selected class from all options
            document.querySelectorAll('.transform-ai-date-option').forEach(el => {
              el.classList.remove('selected');
            });
            // Add selected class to clicked option
            this.classList.add('selected');
            // Auto send after short delay
            setTimeout(() => {
              sendMessage(this.dataset.index);
            }, 300);
          });
          dateGrid.appendChild(dateElement);
        });
        
        messageContent.appendChild(dateGrid);
      }
      else if (text.includes('Available Times')) {
        currentBookingStep = 'select_time';
        
        // Add booking steps indicator
        const stepsIndicator = createBookingSteps('select_time');
        
        // Parse and create time selection UI
        const timeOptions = parseTimeOptions(text);
        const dateSelected = extractDateSelected(text);
        
        messageDiv.innerHTML = `Please select a time for ${dateSelected}:`;
        messageContent.appendChild(messageDiv);
        messageContent.appendChild(stepsIndicator);
        
        const timeGrid = document.createElement('div');
        timeGrid.className = 'transform-ai-time-grid';
        
        timeOptions.forEach((timeOption, index) => {
          const timeElement = document.createElement('div');
          timeElement.className = 'transform-ai-time-option';
          timeElement.dataset.index = index + 1;
          timeElement.textContent = timeOption;
          timeElement.addEventListener('click', function() {
            // Remove selected class from all options
            document.querySelectorAll('.transform-ai-time-option').forEach(el => {
              el.classList.remove('selected');
            });
            // Add selected class to clicked option
            this.classList.add('selected');
            // Auto send after short delay
            setTimeout(() => {
              sendMessage(this.dataset.index);
            }, 300);
          });
          timeGrid.appendChild(timeElement);
        });
        
        messageContent.appendChild(timeGrid);
      }
      else {
        // Default booking message handling
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        messageContent.appendChild(messageDiv);
      }
      
      container.appendChild(avatarDiv);
      container.appendChild(messageContent);
      
      messageContainer.appendChild(container);
    }
    
    // Create booking step indicator
    function createBookingSteps(currentStep) {
      const stepsContainer = document.createElement('div');
      stepsContainer.className = 'transform-ai-booking-steps';
      
      // Display steps
      const displaySteps = [
        { id: 'select_day', label: 'Date' },
        { id: 'select_time', label: 'Time' },
        { id: 'personal_info', label: 'Details' },
        { id: 'complete', label: 'Done' }
      ];
      
      // Determine the stage
      let activeStepIndex = -1;
      
      if (currentStep === 'select_day' || currentStep === 'select_date') {
        activeStepIndex = 0; // Date
      } else if (currentStep === 'select_time') {
        activeStepIndex = 1; // Time
      } else if (currentStep === 'confirm_details' || currentStep === 'personal_info') {
        activeStepIndex = 2; // Details
      } else if (currentStep === 'complete') {
        activeStepIndex = 3; // Done
      }
      
      // Create step elements
      displaySteps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'transform-ai-booking-step';
        
        if (index === activeStepIndex) {
          stepElement.classList.add('active');
        } else if (index < activeStepIndex) {
          stepElement.classList.add('completed');
        }
        
        const stepNumber = document.createElement('div');
        stepNumber.className = 'transform-ai-step-number';
        stepNumber.textContent = index + 1;
        
        const stepLabel = document.createElement('div');
        stepLabel.textContent = step.label;
        
        stepElement.appendChild(stepNumber);
        stepElement.appendChild(stepLabel);
        stepsContainer.appendChild(stepElement);
      });
      
      return stepsContainer;
    }
    
    // Helper functions for parsing booking data
    function parseDateOptions(text) {
      // Extract date options from text
      const dateOptions = [];
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.match(/^\d+\.\s/)) {
          const dateText = line.replace(/^\d+\.\s/, '').trim();
          dateOptions.push(dateText);
        }
      }
      
      return dateOptions;
    }
    
    function parseTimeOptions(text) {
      // Extract time options from text
      const timeOptions = [];
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.match(/^\d+\.\s/)) {
          const timeText = line.replace(/^\d+\.\s/, '').trim();
          timeOptions.push(timeText);
        }
      }
      
      return timeOptions;
    }
    
    function extractDateSelected(text) {
      // Extract selected date from time selection message
      const match = text.match(/Available Times for (.*?):/);
      return match ? match[1] : '';
    }
    
    // Helper function to determine if we should add option buttons
    function shouldAddOptions(text) {
      // Add buttons if the message is asking about services or solutions
      return text.toLowerCase().includes('service') || 
             text.toLowerCase().includes('solution') ||
             text.toLowerCase().includes('help you with') ||
             text.toLowerCase().includes('assist you') ||
             text.toLowerCase().includes('interested in');
    }
    
    // Helper function to create contextual option buttons based on text
    function createOptionButtons(text) {
      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'transform-ai-options-container';
      
      let buttons = [];
      
      // Services related
      if (text.toLowerCase().includes('service') || text.toLowerCase().includes('offer')) {
        buttons = ['Chatbot development', 'AI automation', 'Custom AI solutions', 'Website AI integration'];
      }
      // Solutions related
      else if (text.toLowerCase().includes('solution') || text.toLowerCase().includes('problem')) {
        buttons = ['Reduce workload', 'Improve customer experience', 'Increase sales', 'Data analysis'];
      }
      // General follow-up
      else if (text.includes('?')) {
        buttons = ['Tell me more', 'Book a consultation', 'Pricing information', 'How it works'];
      }
      
      if (buttons.length === 0) return null;
      
      buttons.forEach(buttonText => {
        const button = document.createElement('button');
        button.className = 'transform-ai-option-button';
        button.textContent = buttonText;
        button.addEventListener('click', () => sendMessage(buttonText));
        optionsContainer.appendChild(button);
      });
      
      return optionsContainer;
    }
    
    function showTypingIndicator() {
      const typingContainer = document.createElement('div');
      typingContainer.className = 'transform-ai-typing-container';
      typingContainer.id = 'transform-ai-typing-indicator';
      
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'transform-ai-bot-avatar';
      avatarDiv.textContent = '🤖';
      
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'transform-ai-typing-indicator';
      
      // Add animated dots
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'transform-ai-typing-dot';
        typingIndicator.appendChild(dot);
      }
      
      typingContainer.appendChild(avatarDiv);
      typingContainer.appendChild(typingIndicator);
      
      chatMessages.appendChild(typingContainer);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      return typingContainer;
    }
    
    async function sendMessage(message) {
      // Display user message
      addMessage(message, true);
      
      // Show typing indicator
      const typingContainer = showTypingIndicator();
      
      // Disable input while waiting for response
      chatInput.disabled = true;
      document.getElementById('transform-ai-send-button').disabled = true;
      if (errorMessage) errorMessage.textContent = '';
      
      try {
        // Prepare payload
        const payload = {
          message: message,
          sessionId: sessionId
        };
        
        const response = await fetch(`${SERVER_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        if (typingContainer) {
          chatMessages.removeChild(typingContainer);
        }
        
        // Add bot response to chat
        addMessage(data.response, false);
        
        // Store session ID
        if (data.sessionId) {
          sessionId = data.sessionId;
          localStorage.setItem('transform-ai-session-id', sessionId);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove typing indicator
        if (typingContainer) {
          chatMessages.removeChild(typingContainer);
        }
        
        // Display error message
        if (errorMessage) {
          errorMessage.textContent = 'Sorry, there was a problem connecting to the assistant. Please try again.';
        }
      } finally {
        // Re-enable input
        chatInput.disabled = false;
        document.getElementById('transform-ai-send-button').disabled = false;
        chatInput.focus();
      }
    }
    
    // Check for URL param to auto-open
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('open-chat')) {
      openChat();
    }
  };

  // Initialize everything
  const initialize = () => {
    injectMetaTags();
    injectStyles();
    injectHTML();
    fixIOSViewportHeight();
    fixIOSScrolling();
    initChat();
  };

  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();