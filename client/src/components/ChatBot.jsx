import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ChatBot.css';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your Culinary Companion 🍳. I can help you with recipes, cooking tips, ingredient substitutions, and more! What would you like to know?", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Fallback responses for common questions
  const getFallbackResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    const responses = {
      'banana': `**Delicious Banana Recipes!** 🍌

**1. Classic Banana Bread**
• 3 ripe bananas, mashed
• 1/3 cup melted butter  
• 3/4 cup sugar
• 1 egg, beaten
• 1 tsp vanilla
• 1 tsp baking soda
• Pinch of salt
• 1 1/2 cups flour

*Mix wet ingredients, then dry. Bake at 350°F for 55-65 minutes.*

**2. Banana Smoothie**
• 2 bananas
• 1 cup milk
• 1/2 cup yogurt  
• 1 tbsp honey
• Ice cubes

*Blend until smooth! Perfect for breakfast.*

**3. Banana Pancakes**
• 2 bananas, mashed
• 2 eggs
• 1/4 cup flour
• 1 tsp baking powder

*Cook on griddle until golden brown. Serve with maple syrup!*`,

      'egg': `**Egg Substitutes for Baking** 🥚→🔄

**For Binding:**
• **Mashed Banana** - 1/4 cup per egg (adds sweetness)
• **Applesauce** - 1/4 cup per egg (great for cakes)
• **Yogurt** - 1/4 cup per egg (keeps things moist)
• **Silken Tofu** - 1/4 cup blended per egg (neutral flavor)

**For Leavening:**
• **Vinegar + Baking Soda** - 1 tbsp vinegar + 1 tsp baking soda per egg
• **Aquafaba** - 3 tbsp chickpea liquid per egg (whip it first!)

**Best Uses:**
• **Cakes/Muffins** → Mashed banana or applesauce
• **Brownies** → Yogurt or silken tofu  
• **Cookies** → Commercial egg replacer works best`,

      'dinner': `**Quick Dinner Ideas** 🍽️

**1. 15-Minute Pasta**
• Cook pasta, reserve 1 cup pasta water
• Sauté garlic in olive oil
• Add cherry tomatoes, cook until bursting
• Toss with pasta, pasta water, and fresh basil
• Top with parmesan

**2. Stir-Fry**
• Protein (chicken, tofu, shrimp)
• Mixed vegetables (bell peppers, broccoli, carrots)
• Soy sauce, garlic, ginger
• Serve over rice or noodles

**3. Sheet Pan Salmon**
• Salmon fillets + broccoli + sweet potatoes
• Toss with olive oil, salt, pepper, lemon
• Bake at 400°F for 15-20 minutes`,

      'healthy': `**Healthy Breakfast Ideas** 🥗

**1. Overnight Oats**
• 1/2 cup oats + 1/2 cup milk
• 1 tbsp chia seeds + 1 tsp honey
• Toppings: berries, nuts, banana
• Refrigerate overnight

**2. Veggie Scramble**
• 2 eggs scrambled with spinach, mushrooms, tomatoes
• Whole wheat toast
• Avocado slice

**3. Greek Yogurt Bowl**
• Greek yogurt + mixed berries
• Granola + honey drizzle
• Flax seeds for extra fiber`,

      'default': `I'd love to help you with cooking and recipes! Here are some things I can assist with:

🍳 **Recipe Ideas** - Tell me ingredients you have
🔧 **Cooking Techniques** - Baking, grilling, sautéing  
🔄 **Ingredient Substitutions** - Missing something?
⏱️ **Quick Meals** - Fast and easy recipes
🥗 **Healthy Options** - Nutritious meal ideas
🍰 **Baking Help** - Measurements, temperatures, tips

What would you like to cook today? Feel free to ask about specific ingredients, cooking methods, or dietary needs!`
    };

    if (input.includes('banana')) return responses.banana;
    if (input.includes('egg') && (input.includes('substitute') || input.includes('replace'))) return responses.egg;
    if (input.includes('dinner') || input.includes('quick meal')) return responses.dinner;
    if (input.includes('healthy') && input.includes('breakfast')) return responses.healthy;
    if (input.includes('breakfast')) return responses.healthy;
    return responses.default;
  };

  // Initialize Gemini AI with error handling
  const initializeGemini = () => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    // Debug log
    console.log('🔑 API Key Status:', {
      exists: !!apiKey,
      isDefault: apiKey === 'your_actual_api_key_here',
      length: apiKey?.length
    });
    
    if (!apiKey || apiKey === 'your_actual_api_key_here') {
      console.log('🍳 Using fallback mode - no API key configured');
      return null;
    }
    
    try {
      return new GoogleGenerativeAI(apiKey);
    } catch (error) {
      console.error('❌ Error initializing Gemini AI:', error);
      return null;
    }
  };

  const genAI = initializeGemini();

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts and user is logged in
  useEffect(() => {
    if (user && isOpen) {
      loadChatHistory();
    }
  }, [user, isOpen]);

  const loadChatHistory = async () => {
    try {
      const response = await API.get('/chat/history');
      if (response.data && response.data.length > 0) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = async (updatedMessages) => {
    if (user) {
      try {
        await API.post('/chat/save', { messages: updatedMessages });
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      text: input, 
      sender: 'user',
      timestamp: new Date()
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Try Gemini AI first if available
      if (genAI) {
        console.log('🔄 Using Gemini AI...');
        
        const cookingPrompt = `You are "Culinary Companion", a friendly cooking assistant. Help with recipes, tips, substitutions. Keep responses under 250 words. Be enthusiastic!

User: ${input}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(cookingPrompt);
        const response = await result.response;
        
        const botMessage = { 
          text: response.text(), 
          sender: 'bot',
          timestamp: new Date()
        };
        
        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);
        saveChatHistory(finalMessages);
      } else {
        // Use fallback responses
        console.log('🍳 Using fallback responses');
        const fallbackResponse = getFallbackResponse(input);
        const botMessage = { 
          text: fallbackResponse, 
          sender: 'bot',
          timestamp: new Date()
        };
        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);
        saveChatHistory(finalMessages);
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      
      // Use fallback on error
      const fallbackResponse = getFallbackResponse(input);
      const errorMessageObj = { 
        text: fallbackResponse, 
        sender: 'bot',
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, errorMessageObj];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = async () => {
    const defaultMessages = [
      { 
        text: "Hello! I'm your Culinary Companion 🍳. I can help you with recipes, cooking tips, ingredient substitutions, and more! What would you like to know?", 
        sender: 'bot',
        timestamp: new Date()
      }
    ];
    setMessages(defaultMessages);
    
    if (user) {
      try {
        await API.delete('/chat/clear');
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <span className="chatbot-icon">🍳</span>
          <span className="chatbot-text">Culinary Companion</span>
          {!genAI && <span className="offline-badge">Offline</span>}
        </button>
      )}
      
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="chatbot-icon">🍳</span>
              <h3>Culinary Companion</h3>
              {!genAI && <span className="offline-mode">🔴 Offline Mode</span>}
              {user && <span className="user-indicator">👤 {user.username}</span>}
            </div>
            <div className="chatbot-actions">
              <button className="clear-btn" onClick={clearChat} title="Clear chat">
                🗑️
              </button>
              <button className="close-btn" onClick={() => setIsOpen(false)} title="Close chat">
                ×
              </button>
            </div>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-content">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input-container">
            <div className="suggestion-chips">
              <button onClick={() => handleSuggestionClick("Banana recipes")}>
                Banana Recipes
              </button>
              <button onClick={() => handleSuggestionClick("How to substitute eggs in baking?")}>
                Egg Substitutes
              </button>
              <button onClick={() => handleSuggestionClick("Quick dinner ideas")}>
                Quick Dinner
              </button>
              <button onClick={() => handleSuggestionClick("Healthy breakfast recipes")}>
                Healthy Breakfast
              </button>
            </div>
            <div className="chatbot-input">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about recipes, cooking tips, or ingredient substitutions..."
                rows="1"
              />
              <button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                className="send-btn"
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
            {!genAI && (
              <div className="offline-notice">
                🔴 Offline Mode - Using built-in responses. Add API key for AI features.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;