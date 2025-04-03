document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const setupSection = document.getElementById('setup-section');
    const chatSection = document.getElementById('chat-section');
    const progressSteps = document.querySelectorAll('.progress-step');
    const stepContents = document.querySelectorAll('.step-content');
    const nicheCards = document.querySelectorAll('.niche-card');
    const hourOptions = document.querySelectorAll('.hour-option');
    const promptTemplates = document.querySelectorAll('.template-card');
    const launchButton = document.getElementById('launch-chatbot-btn');
    const backToSetupButton = document.getElementById('back-to-setup-btn');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const welcomeMessage = document.getElementById('welcome-message');
    const chatTitle = document.getElementById('chat-title');
    const businessPanelName = document.getElementById('business-panel-name');
    const aboutText = document.getElementById('about-text');
    const servicesList = document.getElementById('services-list');
    const featuresList = document.getElementById('features-list');
    const hoursText = document.getElementById('hours-text');
    const locationText = document.getElementById('location-text');
    const businessNameInput = document.getElementById('business-name');
    const businessDescriptionInput = document.getElementById('business-description');
    const businessLocationInput = document.getElementById('business-location');
    const checkAdvanced = document.getElementById('check-advanced');
    const advancedPrompt = document.getElementById('advanced-prompt');
    const currentPromptSection = document.getElementById('current-prompt');
    const updatePromptButton = document.getElementById('update-prompt-btn');
    const saveServiceButton = document.getElementById('save-service-btn');
    const saveFeatureButton = document.getElementById('save-feature-btn');
    const newServiceInput = document.getElementById('new-service-name');
    const newFeatureInput = document.getElementById('new-feature-name');
    const widgetButton = document.getElementById('transform-ai-widget-button');
    const widgetContainer = document.getElementById('transform-ai-widget-container');
    const widgetClose = document.querySelector('.widget-close');
    
    // Initial values
    let currentStep = 1;
    let currentNiche = 'dental';
    let businessHours = 'standard';
    let selectedServices = ['checkups', 'cleaning'];
    let selectedFeatures = [];
    let aiPersonality = 'friendly';
    let businessName = 'Smile Bright Dental';
    let businessDescription = 'A modern dental practice focused on patient comfort and advanced care.';
    let businessLocation = '123 Main Street, San Francisco, CA 94103';
    
    // Industry-specific data
    const industryData = {
        dental: {
            icon: 'tooth',
            services: [
                { id: 'checkups', name: 'Regular check-ups' },
                { id: 'cleaning', name: 'Teeth cleaning' },
                { id: 'cosmetic', name: 'Cosmetic dentistry' },
                { id: 'whitening', name: 'Teeth whitening' },
                { id: 'rootcanal', name: 'Root canal' },
                { id: 'implants', name: 'Dental implants' },
                { id: 'invisalign', name: 'Invisalign' }
            ],
            features: [
                { id: 'insurance', name: 'Insurance accepted' },
                { id: 'financing', name: 'Financing options' },
                { id: 'emergency', name: 'Emergency services' },
                { id: 'family', name: 'Family-friendly' },
                { id: 'latest-tech', name: 'Latest technology' }
            ],
            defaultName: 'Smile Bright Dental',
            defaultDescription: 'A modern dental practice focused on patient comfort and advanced care.'
        },
        realEstate: {
            icon: 'home',
            services: [
                { id: 'residential', name: 'Residential sales' },
                { id: 'commercial', name: 'Commercial properties' },
                { id: 'rentals', name: 'Rentals' },
                { id: 'property-management', name: 'Property management' },
                { id: 'investment', name: 'Investment properties' },
                { id: 'first-time', name: 'First-time buyers' },
                { id: 'luxury', name: 'Luxury homes' }
            ],
            features: [
                { id: 'free-valuation', name: 'Free property valuation' },
                { id: 'virtual-tours', name: 'Virtual tours' },
                { id: 'staging', name: 'Home staging' },
                { id: 'financing', name: 'Financing assistance' },
                { id: 'relocation', name: 'Relocation services' }
            ],
            defaultName: 'Horizon Properties',
            defaultDescription: 'A trusted real estate agency with over 15 years of experience in residential and commercial properties.'
        },
        restaurant: {
            icon: 'utensils',
            services: [
                { id: 'dining', name: 'In-restaurant dining' },
                { id: 'takeout', name: 'Takeout service' },
                { id: 'delivery', name: 'Delivery service' },
                { id: 'catering', name: 'Catering' },
                { id: 'private-events', name: 'Private events' },
                { id: 'special-menu', name: 'Special menu options' },
                { id: 'bar', name: 'Full-service bar' }
            ],
            features: [
                { id: 'reservations', name: 'Online reservations' },
                { id: 'outdoor', name: 'Outdoor seating' },
                { id: 'parking', name: 'Free parking' },
                { id: 'wifi', name: 'Free WiFi' },
                { id: 'vegetarian', name: 'Vegetarian options' },
                { id: 'gluten-free', name: 'Gluten-free options' }
            ],
            defaultName: 'Fusion Kitchen',
            defaultDescription: 'An innovative restaurant offering a blend of international cuisines with locally sourced ingredients.'
        },
        fitness: {
            icon: 'dumbbell',
            services: [
                { id: 'personal-training', name: 'Personal Training' },
                { id: 'group-classes', name: 'Group Classes' },
                { id: 'nutrition', name: 'Nutrition Coaching' },
                { id: 'yoga', name: 'Yoga Classes' },
                { id: 'pilates', name: 'Pilates' }
            ],
            features: [
                { id: 'equipment', name: 'Modern Equipment' },
                { id: 'childcare', name: 'Childcare Available' },
                { id: 'open-24', name: '24/7 Access' },
                { id: 'locker-rooms', name: 'Luxury Locker Rooms' }
            ],
            defaultName: 'PowerFit Studio',
            defaultDescription: 'A modern fitness center offering personalized training programs and a variety of group classes.'
        },
        salon: {
            icon: 'cut',
            services: [
                { id: 'haircut', name: 'Haircuts' },
                { id: 'coloring', name: 'Hair Coloring' },
                { id: 'styling', name: 'Hair Styling' },
                { id: 'treatments', name: 'Hair Treatments' },
                { id: 'nails', name: 'Nail Services' }
            ],
            features: [
                { id: 'products', name: 'Professional Products' },
                { id: 'online-booking', name: 'Online Booking' },
                { id: 'wedding', name: 'Wedding Services' }
            ],
            defaultName: 'Elegance Hair Salon',
            defaultDescription: 'A full-service salon dedicated to making you look and feel your best.'
        },
        law: {
            icon: 'balance-scale',
            services: [
                { id: 'family', name: 'Family Law' },
                { id: 'criminal', name: 'Criminal Defense' },
                { id: 'corporate', name: 'Corporate Law' },
                { id: 'real-estate', name: 'Real Estate Law' },
                { id: 'estate-planning', name: 'Estate Planning' }
            ],
            features: [
                { id: 'free-consult', name: 'Free Consultation' },
                { id: 'virtual', name: 'Virtual Meetings' },
                { id: 'payment-plans', name: 'Payment Plans' }
            ],
            defaultName: 'Justice Legal Group',
            defaultDescription: 'A dedicated legal team committed to protecting your rights and interests.'
        },
        ecommerce: {
            icon: 'shopping-cart',
            services: [
                { id: 'clothing', name: 'Clothing' },
                { id: 'electronics', name: 'Electronics' },
                { id: 'home-goods', name: 'Home Goods' },
                { id: 'subscription', name: 'Subscription Boxes' }
            ],
            features: [
                { id: 'free-shipping', name: 'Free Shipping' },
                { id: 'returns', name: 'Easy Returns' },
                { id: 'rewards', name: 'Loyalty Program' },
                { id: 'international', name: 'International Shipping' }
            ],
            defaultName: 'Modern Market',
            defaultDescription: 'An online marketplace offering quality products with exceptional customer service.'
        },
        hotel: {
            icon: 'hotel',
            services: [
                { id: 'rooms', name: 'Rooms & Suites' },
                { id: 'dining', name: 'Restaurant & Dining' },
                { id: 'conference', name: 'Conference Facilities' },
                { id: 'spa', name: 'Spa & Wellness' }
            ],
            features: [
                { id: 'wifi', name: 'Free WiFi' },
                { id: 'breakfast', name: 'Complimentary Breakfast' },
                { id: 'pool', name: 'Swimming Pool' },
                { id: 'fitness', name: 'Fitness Center' }
            ],
            defaultName: 'Grand Plaza Hotel',
            defaultDescription: 'A luxury hotel offering exceptional accommodations and world-class amenities.'
        },
        healthcare: {
            icon: 'heartbeat',
            services: [
                { id: 'primary', name: 'Primary Care' },
                { id: 'specialist', name: 'Specialist Consultations' },
                { id: 'pediatrics', name: 'Pediatrics' },
                { id: 'preventive', name: 'Preventive Care' }
            ],
            features: [
                { id: 'insurance', name: 'Insurance Accepted' },
                { id: 'virtual', name: 'Telehealth Services' },
                { id: 'weekend', name: 'Weekend Hours' },
                { id: 'labs', name: 'On-site Laboratory' }
            ],
            defaultName: 'Wellness Medical Center',
            defaultDescription: 'A patient-centered medical practice dedicated to comprehensive healthcare for the whole family.'
        },
        education: {
            icon: 'graduation-cap',
            services: [
                { id: 'k12', name: 'K-12 Programs' },
                { id: 'tutoring', name: 'Tutoring Services' },
                { id: 'college-prep', name: 'College Prep' },
                { id: 'adult-ed', name: 'Adult Education' }
            ],
            features: [
                { id: 'small-classes', name: 'Small Class Sizes' },
                { id: 'certified', name: 'Certified Teachers' },
                { id: 'personalized', name: 'Personalized Learning Plans' },
                { id: 'remote', name: 'Remote Learning Options' }
            ],
            defaultName: 'Excellence Learning Academy',
            defaultDescription: 'An educational institution committed to fostering academic excellence and lifelong learning.'
        }
    };
    
    // Hours configurations
    const hoursConfigs = {
        standard: 'Monday-Friday: 9:00 AM - 5:00 PM',
        extended: 'Monday-Saturday: 8:00 AM - 8:00 PM',
        weekend: 'Monday-Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: 12:00 PM - 4:00 PM',
        '24-7': 'Open 24 hours, 7 days a week',
        custom: 'Custom hours'
    };
    
    // Function to navigate between steps
    function navigateToStep(stepNumber) {
        // Hide all step contents
        stepContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Show the target step content
        const targetContent = document.querySelector(`.step-content[data-step="${stepNumber}"]`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Update progress bar
        progressSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            if (stepNum < stepNumber) {
                step.classList.remove('active');
                step.classList.add('completed');
            } else if (stepNum === stepNumber) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        // Update current step
        currentStep = stepNumber;
    }
    
    // Function to toggle service/feature selection
    function toggleSelection(element) {
        const isSelected = element.classList.contains('selected');
        const hasCheckIcon = element.querySelector('i').classList.contains('fa-check-circle');
        
        if (isSelected) {
            element.classList.remove('selected');
            if (hasCheckIcon) {
                element.querySelector('i').classList.remove('fa-check-circle');
                element.querySelector('i').classList.add('fa-circle');
            }
        } else {
            element.classList.add('selected');
            if (!hasCheckIcon) {
                element.querySelector('i').classList.remove('fa-circle');
                element.querySelector('i').classList.add('fa-check-circle');
            }
        }
    }
    
    // Function to update selected services array
    function updateSelectedServices() {
        selectedServices = [];
        document.querySelectorAll(`#${currentNiche}-services .service-tag.selected`).forEach(tag => {
            if (tag.dataset.tag) {
                selectedServices.push(tag.dataset.tag);
            }
        });
    }
    
    // Function to update selected features array
    function updateSelectedFeatures() {
        selectedFeatures = [];
        document.querySelectorAll(`#${currentNiche}-features .service-tag.selected`).forEach(tag => {
            if (tag.dataset.tag) {
                selectedFeatures.push(tag.dataset.tag);
            }
        });
    }
    
    // Initialize service/feature tag event handlers
    function initServiceTags() {
        document.querySelectorAll('.service-tag:not(.add-new-tag)').forEach(tag => {
            tag.addEventListener('click', function() {
                toggleSelection(this);
                updateSelectedServices();
                updatePromptPreview();
            });
        });
        
        document.querySelectorAll('[id$="-features"] .service-tag:not(.add-new-tag)').forEach(tag => {
            tag.addEventListener('click', function() {
                toggleSelection(this);
                updateSelectedFeatures();
                updatePromptPreview();
            });
        });
    }
    
    // Call init function to set up event handlers
    initServiceTags();
    
    // Function to generate the AI prompt based on selected options
    function generateAIPrompt() {
        const name = businessNameInput.value || businessName;
        const description = businessDescriptionInput.value || businessDescription;
        const hours = hoursConfigs[businessHours];
        
        // Get selected services names
        let servicesList = [];
        selectedServices.forEach(serviceId => {
            const industry = industryData[currentNiche];
            if (industry) {
                const service = industry.services.find(s => s.id === serviceId);
                if (service) {
                    servicesList.push(service.name);
                }
            }
        });
        
        // Get selected features names
        let featuresList = [];
        selectedFeatures.forEach(featureId => {
            const industry = industryData[currentNiche];
            if (industry) {
                const feature = industry.features.find(f => f.id === featureId);
                if (feature) {
                    featuresList.push(feature.name);
                }
            }
        });
        
        // Personality styles
        const personalityStyles = {
            friendly: "friendly and helpful manner",
            professional: "professional and formal tone",
            casual: "casual and conversational style",
            enthusiastic: "enthusiastic and energetic voice"
        };
        
        // Communication styles
        let communicationStyles = [];
        if (document.getElementById('check-concise').checked) {
            communicationStyles.push("be concise in your responses");
        }
        if (document.getElementById('check-questions').checked) {
            communicationStyles.push("ask follow-up questions when appropriate");
        }
        if (document.getElementById('check-informative').checked) {
            communicationStyles.push("provide detailed information when needed");
        }
        if (document.getElementById('check-empathetic').checked) {
            communicationStyles.push("show empathy when customers express concerns");
        }
        
        // Knowledge focus
        const knowledgeFocus = document.getElementById('knowledge-focus').value;
        let focusText = "";
        
        if (knowledgeFocus === "business") {
            focusText = "Focus primarily on information about the business, its services, and operations.";
        } else if (knowledgeFocus === "industry") {
            focusText = "Share educational information about the industry and best practices when relevant.";
        } else if (knowledgeFocus === "sales") {
            focusText = "Emphasize the benefits of services and gently encourage potential customers to make appointments or purchases.";
        }
        
        // Compile the prompt
        let prompt = `You are an AI assistant for a ${getIndustryName(currentNiche)} called ${name}. `;
        prompt += `Respond in a ${personalityStyles[aiPersonality]}. `;
        prompt += `You can assist with information about ${description} `;
        
        if (servicesList.length > 0) {
            prompt += `Our services include: ${servicesList.join(', ')}. `;
        }
        
        if (featuresList.length > 0) {
            prompt += `Special features: ${featuresList.join(', ')}. `;
        }
        
        prompt += `Business hours are ${hours}. `;
        
        if (communicationStyles.length > 0) {
            prompt += communicationStyles.join(', ') + '. ';
        }
        
        if (focusText) {
            prompt += focusText;
        }
        
        return prompt;
    }
    
    // Function to get industry name from niche id
    function getIndustryName(niche) {
        const nicheMap = {
            dental: 'dental practice',
            realEstate: 'real estate agency',
            restaurant: 'restaurant',
            fitness: 'fitness studio',
            salon: 'hair salon',
            law: 'law firm',
            ecommerce: 'e-commerce store',
            hotel: 'hotel',
            healthcare: 'healthcare provider',
            education: 'educational institution'
        };
        
        return nicheMap[niche] || 'business';
    }
    
    // Function to update the current prompt preview
    function updatePromptPreview() {
        const prompt = generateAIPrompt();
        document.querySelector('.current-prompt').textContent = prompt;
        document.getElementById('custom-prompt').value = prompt;
    }
    
    // Function to add a message to the chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${isUser ? 'user' : 'bot'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        typingIndicator.style.display = 'block';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to hide typing indicator
    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }
    
    // Function to get AI response (simulated)
    function getAIResponse(message) {
        // In a real implementation, this would call your API
        // For demo purposes, we'll simulate responses
        
        const responses = {
            dental: {
                appointment: "I'd be happy to help you schedule an appointment at Smile Bright Dental. Our available times are Monday through Friday from 9 AM to 5 PM. Would you prefer morning or afternoon? Also, is this for a routine check-up or do you have a specific concern?",
                services: "At Smile Bright Dental, we offer a range of services including regular check-ups, teeth cleaning, and more. Our team is dedicated to providing comfortable and thorough dental care. Is there a specific service you'd like to know more about?",
                hours: "Smile Bright Dental is open Monday through Friday from 9 AM to 5 PM. We're closed on weekends. Would you like to schedule an appointment during our business hours?",
                location: "We're located at 123 Main Street, San Francisco, CA 94103. We have parking available on site, and we're also accessible by public transportation. Would you like directions?",
                insurance: "Yes, we accept most major dental insurance plans. We can verify your coverage before your appointment. Which insurance provider do you have?",
                emergency: "If you're experiencing a dental emergency, please call our office immediately. If it's outside of our regular hours (Monday-Friday, 9-5), our answering service can connect you with our on-call dentist."
            },
            realEstate: {
                properties: "I'd be happy to help you find properties that match your needs. Are you looking for residential or commercial properties? And do you have a specific neighborhood or price range in mind?",
                selling: "If you're considering selling your property, we offer free property valuations and can provide advice on how to maximize your sale price. Would you like to schedule a consultation with one of our agents?",
                buying: "Buying a property is an exciting journey! Would you like information about the current market, mortgage pre-approval, or specific properties? We're here to guide you through the entire process.",
                market: "The current real estate market in this area is quite active. Prices have been steadily increasing over the past year. Are you interested in buying or selling in this market?"
            },
            restaurant: {
                reservation: "I'd be happy to help with a reservation. What date and time would you prefer, and how many people will be in your party?",
                menu: "Our menu features a variety of dishes including customer favorites and seasonal specialties. We also offer vegetarian, vegan, and gluten-free options. Is there a specific type of cuisine you're interested in?",
                delivery: "Yes, we offer delivery within a 5-mile radius. Our delivery hours are the same as our operating hours. Would you like to place an order for delivery?",
                hours: "Our restaurant is open Monday-Thursday from 11 AM to 10 PM, Friday-Saturday from 11 AM to 11 PM, and Sunday from 11 AM to 9 PM. When would you like to visit us?"
            },
            fitness: {
                membership: "We offer several membership options, including monthly and annual plans. All memberships include access to equipment, group classes, and locker rooms. Would you like to hear about our current promotions?",
                classes: "We offer a variety of group fitness classes including yoga, HIIT, cycling, and more. Classes are included with all memberships. Would you like to see our current schedule?",
                training: "Our personal training sessions are customized to help you reach your specific fitness goals. Sessions can be purchased individually or in packages. Would you like to schedule a free consultation with one of our trainers?",
                hours: "Our fitness studio is open Monday-Friday from 5 AM to 11 PM, and Saturday-Sunday from 7 AM to 9 PM. Our classes run throughout the day. Is there a specific time you prefer to work out?"
            }
        };
        
        // Default response if no patterns match
        let response = "Thank you for your message. How else can I assist you today?";
        
        // Lowercase the message for easier matching
        const lowerMessage = message.toLowerCase();
        
        // Check for industry-specific keywords
        if (currentNiche in responses) {
            const nicheResponses = responses[currentNiche];
            
            // Check for keywords in the message
            for (const [key, resp] of Object.entries(nicheResponses)) {
                if (lowerMessage.includes(key) || 
                    (key === 'appointment' && (lowerMessage.includes('book') || lowerMessage.includes('schedule'))) ||
                    (key === 'hours' && (lowerMessage.includes('open') || lowerMessage.includes('close'))) ||
                    (key === 'location' && (lowerMessage.includes('where') || lowerMessage.includes('address')))) {
                    response = resp;
                    break;
                }
            }
        }
        
        // General greetings
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage === 'hey') {
            const name = businessNameInput.value || businessName;
            response = `Hello! Welcome to ${name}. How can I assist you today?`;
        }
        
        // Thank you responses
        if (lowerMessage.includes('thank you') || lowerMessage.includes('thanks')) {
            response = "You're welcome! Is there anything else I can help you with?";
        }
        
        // Price inquiries
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('how much')) {
            response = "We offer competitive pricing for all our services. The exact cost depends on your specific needs. Would you like to discuss your requirements so I can provide more accurate pricing information?";
        }
        
        // Simulate typing delay
        return new Promise(resolve => {
            // Random typing delay between 1 and 3 seconds
            const typingTime = 1000 + Math.random() * 2000;
            setTimeout(() => {
                resolve(response);
            }, typingTime);
        });
    }
    
    // Event Listeners for Next/Back navigation
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const nextStep = parseInt(this.dataset.nextStep);
            navigateToStep(nextStep);
        });
    });
    
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const prevStep = parseInt(this.dataset.prevStep);
            navigateToStep(prevStep);
        });
    });
    
    // Industry selection
    nicheCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            nicheCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to selected card
            this.classList.add('active');
            
            // Update current niche
            currentNiche = this.dataset.niche;
            
            // Show appropriate service/feature tags
            document.querySelectorAll('.tag-container').forEach(container => {
                container.classList.add('d-none');
            });
            
            const servicesContainer = document.getElementById(`${currentNiche}-services`);
            const featuresContainer = document.getElementById(`${currentNiche}-features`);
            
            if (servicesContainer) servicesContainer.classList.remove('d-none');
            if (featuresContainer) featuresContainer.classList.remove('d-none');
            
            // Reset selected services and features
            selectedServices = [];
            if (servicesContainer) {
                const defaultService = servicesContainer.querySelector('.service-tag');
                if (defaultService) {
                    defaultService.classList.add('selected');
                    selectedServices.push(defaultService.dataset.tag);
                }
            }
            
            selectedFeatures = [];
            
            // Pre-fill business name and description based on industry
            if (industryData[currentNiche]) {
                businessNameInput.value = industryData[currentNiche].defaultName;
                businessDescriptionInput.value = industryData[currentNiche].defaultDescription;
                businessName = industryData[currentNiche].defaultName;
                businessDescription = industryData[currentNiche].defaultDescription;
            }
            
            // Update prompt preview
            updatePromptPreview();
        });
    });
    
    // Hours selection
    hourOptions.forEach(option => {
        option.addEventListener('click', function() {
            if (!this.classList.contains('selected') && !this.dataset.bsToggle) {
                // Remove selected class from all options
                hourOptions.forEach(o => o.classList.remove('selected'));
                
                // Add selected class to clicked option
                this.classList.add('selected');
                
                // Update selected hours
                businessHours = this.dataset.hours;
                
                // Update prompt preview
                updatePromptPreview();
            }
        });
    });
    
    // Personality selection
    promptTemplates.forEach(template => {
        template.addEventListener('click', function() {
            // Remove active class from all templates
            promptTemplates.forEach(t => t.classList.remove('active'));
            
            // Add active class to selected template
            this.classList.add('active');
            
            // Update selected personality
            aiPersonality = this.dataset.template;
            
            // Update prompt preview
            updatePromptPreview();
        });
    });
    
    // Advanced prompt toggle
    checkAdvanced.addEventListener('change', function() {
        if (this.checked) {
            advancedPrompt.classList.add('show');
            document.getElementById('custom-prompt').value = generateAIPrompt();
        } else {
            advancedPrompt.classList.remove('show');
        }
    });
    
    // Communication style checkboxes
    document.querySelectorAll('#check-concise, #check-questions, #check-informative, #check-empathetic').forEach(checkbox => {
        checkbox.addEventListener('change', updatePromptPreview);
    });
    
    // Knowledge focus dropdown
    document.getElementById('knowledge-focus').addEventListener('change', updatePromptPreview);
    
    // Update prompt button
    updatePromptButton.addEventListener('click', function() {
        const customPrompt = document.getElementById('custom-prompt').value;
        document.querySelector('.current-prompt').textContent = customPrompt;
    });
    
    // Business details inputs
    businessNameInput.addEventListener('input', function() {
        businessName = this.value;
        updatePromptPreview();
    });
    
    businessDescriptionInput.addEventListener('input', function() {
        businessDescription = this.value;
        updatePromptPreview();
    });
    
    businessLocationInput.addEventListener('input', function() {
        businessLocation = this.value;
    });
    
    // Launch chatbot button
    launchButton.addEventListener('click', function() {
        // Update welcome message based on current settings
        const name = businessNameInput.value || businessName;
        let services = [];
        
        selectedServices.forEach(serviceId => {
            const industry = industryData[currentNiche];
            if (industry) {
                const service = industry.services.find(s => s.id === serviceId);
                if (service) {
                    services.push(service.name.toLowerCase());
                }
            }
        });
        
        const servicesText = services.length > 0 ? 
            `questions about our services like ${services.slice(0, 2).join(' or ')}` : 
            'questions about our services';
        
        welcomeMessage.textContent = `Hi there! I'm your ${getIndustryName(currentNiche)} assistant for ${name}. How can I help you today? Whether you're looking to schedule an appointment, have ${servicesText}, or need information about our business hours (${hoursConfigs[businessHours]}), I'm here to assist!`;
        
        // Update chat title and business panel
        chatTitle.textContent = `${name} AI Assistant`;
        businessPanelName.textContent = name;
        
        // Update business info panel
        aboutText.textContent = businessDescriptionInput.value || businessDescription;
        
        // Update services list
        servicesList.innerHTML = '';
        selectedServices.forEach(serviceId => {
            const industry = industryData[currentNiche];
            if (industry) {
                const service = industry.services.find(s => s.id === serviceId);
                if (service) {
                    const li = document.createElement('li');
                    li.textContent = service.name;
                    servicesList.appendChild(li);
                }
            }
        });
        
        // Update features list
        featuresList.innerHTML = '';
        selectedFeatures.forEach(featureId => {
            const industry = industryData[currentNiche];
            if (industry) {
                const feature = industry.features.find(f => f.id === featureId);
                if (feature) {
                    const li = document.createElement('li');
                    li.textContent = feature.name;
                    featuresList.appendChild(li);
                }
            }
        });
        
        // Update hours and location
        hoursText.textContent = hoursConfigs[businessHours];
        locationText.textContent = businessLocationInput.value || businessLocation;
        
        // Switch to chat section
        setupSection.style.display = 'none';
        chatSection.style.display = 'block';
        
        // Focus on input
        userInput.focus();
    });
    
    // Back to setup button
    backToSetupButton.addEventListener('click', function() {
        setupSection.style.display = 'block';
        chatSection.style.display = 'none';
        
        // Clear chat messages except the welcome message
        const messages = chatMessages.querySelectorAll('.message:not(:first-child)');
        messages.forEach(message => message.remove());
    });
    
    // Send message button
    sendButton.addEventListener('click', async function() {
        const message = userInput.value.trim();
        if (message) {
            // Add user message to chat
            addMessage(message, true);
            
            // Clear input
            userInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Get AI response
            const response = await getAIResponse(message);
            
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add AI response to chat
            addMessage(response);
        }
    });
    
    // Send message on Enter key
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
    
    // Add new service functionality
    saveServiceButton.addEventListener('click', function() {
        const newServiceName = newServiceInput.value.trim();
        if (newServiceName) {
            // Create unique ID
            const newId = 'custom-' + Date.now();
            
            // Create new tag
            const newTag = document.createElement('div');
            newTag.className = 'service-tag selected';
            newTag.dataset.tag = newId;
            newTag.innerHTML = `<i class="fas fa-check-circle"></i> ${newServiceName}`;
            
            // Add click event
            newTag.addEventListener('click', function() {
                toggleSelection(this);
                updateSelectedServices();
                updatePromptPreview();
            });
            
            // Add to container before the "Add Service" button
            const addButton = document.querySelector(`#${currentNiche}-services .add-new-tag`);
            addButton.parentNode.insertBefore(newTag, addButton);
            
            // Add to selected services
            selectedServices.push(newId);
            
            // Add to industry data
            if (industryData[currentNiche]) {
                industryData[currentNiche].services.push({ id: newId, name: newServiceName });
            }
            
            // Update prompt
            updatePromptPreview();
            
            // Clear input
            newServiceInput.value = '';
        }
    });
    
    // Add new feature functionality
    saveFeatureButton.addEventListener('click', function() {
        const newFeatureName = newFeatureInput.value.trim();
        if (newFeatureName) {
            // Create unique ID
            const newId = 'custom-' + Date.now();
            
            // Create new tag
            const newTag = document.createElement('div');
            newTag.className = 'service-tag selected';
            newTag.dataset.tag = newId;
            newTag.innerHTML = `<i class="fas fa-check-circle"></i> ${newFeatureName}`;
            
            // Add click event
            newTag.addEventListener('click', function() {
                toggleSelection(this);
                updateSelectedFeatures();
                updatePromptPreview();
            });
            
            // Add to container before the "Add Feature" button
            const addButton = document.querySelector(`#${currentNiche}-features .add-new-tag`);
            addButton.parentNode.insertBefore(newTag, addButton);
            
            // Add to selected features
            selectedFeatures.push(newId);
            
            // Add to industry data
            if (industryData[currentNiche]) {
                industryData[currentNiche].features.push({ id: newId, name: newFeatureName });
            }
            
            // Update prompt
            updatePromptPreview();
            
            // Clear input
            newFeatureInput.value = '';
        }
    });
    
    // Widget button functionality
    widgetButton.addEventListener('click', function() {
        if (widgetContainer.style.display === 'block') {
            widgetContainer.style.display = 'none';
        } else {
            widgetContainer.style.display = 'block';
            // In a real implementation, you would update the iframe source to your chatbot URL
            document.querySelector('.widget-iframe').src = 'about:blank'; // Placeholder
        }
    });
    
    // Widget close button
    widgetClose.addEventListener('click', function() {
        widgetContainer.style.display = 'none';
    });
    
    // Initialize prompt preview
    updatePromptPreview();
});