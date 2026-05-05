// Mitra — AI-Powered Voting Assistant for IVC
const AuditLog = require('../../shared/models/AuditLog');

// Try to load Google Generative AI (optional)
let GenerativeAI = null;
try {
  GenerativeAI = require('@google/generative-ai')?.GoogleGenerativeAI;
} catch (e) {
  console.log('⚠️  Google Generative AI not installed. Using fallback pattern matching.');
}

const IVC_KNOWLEDGE_BASE = `You are Mitra, the AI voting assistant for the Indian Voting Commission (IVC). 

CORE INFORMATION:
- IVC manages secure voting in India using blockchain technology
- Triple-Lock Authentication: OTP + Aadhaar + Face Recognition
- Users must verify identity through all three methods
- One vote per election per user (enforced by blockchain)
- Elections have stages: Draft → Scheduled → Active → Completed
- Voting only possible during Active phase

VOTING PROCESS:
1. Login with email/password
2. Complete Triple-Lock Authentication (OTP, Aadhaar, Face)
3. Navigate to Voting page
4. Select election → Choose candidate → Confirm vote
5. Receive blockchain receipt ID to verify vote was recorded

REGISTRATION:
- Provide name, email, phone, password
- Verify Aadhaar (national identity)
- Face recognition for biometric verification
- Aadhaar is stored securely and used only for verification

SUPPORT:
- Create support ticket from dashboard for issues
- Track ticket status in real-time
- Categories: Login issues, Voting problems, Aadhaar/Face issues, Technical errors
- Urgent issues get admin response within 24 hours

TONE: Friendly, helpful, professional. Always encourage support tickets for complex issues.`;

const fallbackKnowledgeBase = {
  voting: [
    'To cast your vote, go to the Voting page, select your election, choose your candidate, and confirm.',
    'You can only vote once per election. Your vote is recorded securely with a unique receipt.',
    'Keep your receipt ID safe — you can use it to verify your vote was recorded.',
  ],
  registration: [
    'To register, provide your name, email, phone number, and create a password.',
    'After registration, verify your identity through OTP, Aadhaar, and face verification.',
    'Your Aadhaar number is used for identity verification only and is stored securely.',
  ],
  authentication: [
    'IVC uses Triple-Lock Authentication: OTP verification, Aadhaar verification, and Face recognition.',
    'OTP is sent to your registered email/phone. Enter the 6-digit code to verify.',
    'Face verification uses your camera to match your face with the registered photo.',
  ],
  elections: [
    'Elections go through stages: Draft → Scheduled → Active → Completed.',
    'You can only vote during the Active phase of an election.',
    'View all elections on the home page or your voter dashboard.',
  ],
  support: [
    'Having issues? Create a support ticket from your dashboard.',
    'You can track your ticket status and receive responses from the admin team.',
    'Common categories: Login issues, Voting issues, Aadhaar problems, Technical errors.',
  ],
  general: [
    'Welcome to IVC — Indian Voting Commission. I\'m Mitra, your voting assistant!',
    'I can help with voting, registration, authentication, elections, and support queries.',
    'For urgent issues, please create a support ticket from your dashboard.',
  ],
};

// Enhanced pattern matching (fallback when AI not available)
function findBestResponse(message) {
  const lower = message.toLowerCase();
  if (lower.match(/vote|cast|ballot|elect.*candidate|how.*vote/)) 
    return { category: 'voting', responses: fallbackKnowledgeBase.voting };
  if (lower.match(/register|sign.?up|create.*account|new.*user/)) 
    return { category: 'registration', responses: fallbackKnowledgeBase.registration };
  if (lower.match(/login|otp|aadhaar|face|auth|verify|password|mfa|triple.?lock/)) 
    return { category: 'authentication', responses: fallbackKnowledgeBase.authentication };
  if (lower.match(/election|schedule|active|upcoming|result|when|voting.*period/)) 
    return { category: 'elections', responses: fallbackKnowledgeBase.elections };
  if (lower.match(/help|support|ticket|issue|problem|error|bug|not.*work/)) 
    return { category: 'support', responses: fallbackKnowledgeBase.support };
  if (lower.match(/hi|hello|hey|namaste|start|what|who|greet/)) 
    return { category: 'general', responses: fallbackKnowledgeBase.general };
  return { 
    category: 'general', 
    responses: ['I\'m not sure about that. Try asking about voting, registration, authentication, elections, or support. For complex issues, create a support ticket from your dashboard!'] 
  };
}

function getSuggestions(category) {
  const suggestions = {
    voting: ['How do I check my vote?', 'Can I change my vote?', 'Where is my receipt?'],
    registration: ['What documents do I need?', 'How to verify Aadhaar?', 'Registration issues'],
    authentication: ['OTP not received', 'Face verification failed', 'How to setup Triple-Lock?'],
    elections: ['Show active elections', 'When can I vote?', 'How to view results?'],
    support: ['Create a ticket', 'Check ticket status', 'Contact admin'],
    general: ['How to vote?', 'How to register?', 'What is Triple-Lock?'],
  };
  return suggestions[category] || suggestions.general;
}

// Real AI response using Google Generative AI
async function getAIResponse(message, useRealAI = false) {
  if (!useRealAI || !GenerativeAI || !process.env.GOOGLE_API_KEY) {
    return null; // Use fallback
  }

  try {
    const client = new GenerativeAI(process.env.GOOGLE_API_KEY);
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${IVC_KNOWLEDGE_BASE}\n\nUser Question: ${message}\n\nProvide a helpful, concise response about IVC voting.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
      }
    });

    const response = result.response.text();
    return response;
  } catch (error) {
    console.error('❌ AI Error:', error.message);
    return null; // Fallback to pattern matching
  }
}

const Conversation = require('../../shared/models/Conversation');



// Main chat endpoint
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Load or create conversation history
    let conversation = null;
    if (userId) {
      conversation = await Conversation.findOne({ userId }).sort({ updatedAt: -1 });
    }

    if (!conversation) {
      conversation = new Conversation({ userId, messages: [] });
    }

    // Build context from history
    const historyContext = conversation.messages
      .slice(-5) // Get last 5 messages for context
      .map(m => `${m.role === 'user' ? 'User' : 'Mitra'}: ${m.content}`)
      .join('\n');

    const fullPrompt = `${IVC_KNOWLEDGE_BASE}\n\nCONVERSATION HISTORY:\n${historyContext}\n\nUser: ${message}\nMitra:`;

    // Try real AI first if available
    let reply = null;
    let category = 'general';
    let usedAI = false;

    if (process.env.GOOGLE_API_KEY && GenerativeAI) {
      try {
        const client = new GenerativeAI(process.env.GOOGLE_API_KEY);
        const model = client.getGenerativeModel({ model: 'gemini-pro' });
        
        const result = await model.generateContent(fullPrompt);
        reply = result.response.text();
        usedAI = true;
      } catch (error) {
        console.error('AI Error, falling back:', error.message);
      }
    }

    // Fallback to pattern matching
    if (!reply) {
      const result = findBestResponse(message);
      category = result.category;
      reply = result.responses[Math.floor(Math.random() * result.responses.length)];
    }

    // Save to conversation history
    conversation.messages.push({ role: 'user', content: message });
    conversation.messages.push({ role: 'assistant', content: reply });
    conversation.lastInteraction = new Date();
    await conversation.save();

    // Log user interaction for audit
    if (userId) {
      try {
        await AuditLog.log({
          action: 'MITRA_CHAT',
          userId,
          details: `Query: "${message.substring(0, 50)}...", AI: ${usedAI}`,
          ipAddress: req.ip
        });
      } catch (e) {}
    }

    res.json({
      reply,
      category,
      suggestions: getSuggestions(category),
      aiPowered: usedAI,
    });
  } catch (error) {
    console.error('Mitra Chat Error:', error);
    res.status(500).json({ 
      message: 'Mitra encountered an error. Please try again or create a support ticket.',
      error: error.message 
    });
  }
};
