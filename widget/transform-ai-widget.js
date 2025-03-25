/**
 * TransformAI Chat Widget
 * Version: 1.0.2
 * 
 * This script creates a floating chat widget that connects to
 * the TransformAI Solutions chatbot backend.
 * 
 * Usage: 
 * <script src="https://chatbot-njg2.onrender.com/transform-ai-widget.js" 
 *         data-server-url="https://chatbot-njg2.onrender.com"></script>
 */

(function() {
  // Configuration
  const script = document.currentScript;
  const SERVER_URL = script.getAttribute('data-server-url') || 'https://chatbot-njg2.onrender.com';
  
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
      
      /* Responsive Styles - Mobile Improvements */
      @media (max-width: 480px) {
        #transform-ai-chat-window {
          width: 90%;
          height: 80vh;
          max-height: 600px;
          right: 5%;
          bottom: 80px;
        }
        
        #transform-ai-chat-input {
          font-size: 16px; /* Prevents zoom on mobile */
        }
        
        .transform-ai-welcome-container {
          gap: 8px;
        }
      }
      
      /* Very small screens */
      @media (max-width: 375px) {
        #transform-ai-chat-window {
          width: 95%;
          right: 2.5%;
        }
        
        #transform-ai-chat-messages {
          padding: 10px;
        }
        
        .transform-ai-options-container {
          justify-content: center;
        }
      }
      
      /* Fix for iOS */
      @media (pointer: coarse) {
        #transform-ai-chat-input,
        .transform-ai-option-button,
        #transform-ai-send-button {
          -webkit-tap-highlight-color: rgba(0,0,0,0);
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
              <div class="transform-ai-welcome-heading">TransformAI</div>
              <div class="transform-ai-message bot">
                Hello! I'm your AI assistant from TransformAI. How can I help make AI work for your business today?
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
        <div class="transform-ai-powered-by">Powered by TransformAI</div>
      </div>
    `;
    
    document.body.appendChild(container);
  };

  // Add minimal mobile viewport meta tag if not present
  const addViewportMeta = () => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(meta);
    }
  };

  // Fix iOS input zoom issue
  const fixIosInputZoom = () => {
    document.addEventListener('focusin', function(e) {
      if (e.target.id === 'transform-ai-chat-input') {
        // Ensure proper scrolling to input when keyboard opens
        setTimeout(() => {
          e.target.scrollIntoView(false);
        }, 300);
      }
    });
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
    
    // Event Listeners
    chatButton.addEventListener('click', openChat);
    closeChatBtn.addEventListener('click', hideChat);
    chatForm.addEventListener('submit', handleSubmit);
    
    // Setup option buttons
    optionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const buttonText = button.textContent;
        sendMessage(buttonText);
      });
    });
    
    // Functions
    function openChat() {
      chatWindow.style.display = 'flex';
      chatButton.style.display = 'none';
      chatInput.focus();
      
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
      
      chatMessages.appendChild(messageContainer);
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
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

  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addViewportMeta();
      injectStyles();
      injectHTML();
      fixIosInputZoom();
      initChat();
    });
  } else {
    addViewportMeta();
    injectStyles();
    injectHTML();
    fixIosInputZoom();
    initChat();
  }
})();