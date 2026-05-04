// Mitra — Simple AI Assistant for IVC
const knowledgeBase = {
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

function findBestResponse(message) {
  const lower = message.toLowerCase();
  if (lower.match(/vote|cast|ballot|elect.*candidate/)) return { category: 'voting', responses: knowledgeBase.voting };
  if (lower.match(/register|sign.?up|create.*account|new.*user/)) return { category: 'registration', responses: knowledgeBase.registration };
  if (lower.match(/login|otp|aadhaar|face|auth|verify|password|mfa/)) return { category: 'authentication', responses: knowledgeBase.authentication };
  if (lower.match(/election|schedule|active|upcoming|result/)) return { category: 'elections', responses: knowledgeBase.elections };
  if (lower.match(/help|support|ticket|issue|problem|error|bug/)) return { category: 'support', responses: knowledgeBase.support };
  if (lower.match(/hi|hello|hey|namaste|start|what|who/)) return { category: 'general', responses: knowledgeBase.general };
  return { category: 'general', responses: ['I\'m not sure about that. Try asking about voting, registration, authentication, elections, or support. Or create a support ticket for detailed help.'] };
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const result = findBestResponse(message);
    const response = result.responses[Math.floor(Math.random() * result.responses.length)];

    res.json({
      reply: response,
      category: result.category,
      suggestions: getSuggestions(result.category),
    });
  } catch (error) { res.status(500).json({ message: 'Mitra error', error: error.message }); }
};

function getSuggestions(category) {
  const suggestions = {
    voting: ['How do I check my vote?', 'Can I change my vote?', 'Where is my receipt?'],
    registration: ['What documents do I need?', 'How to verify Aadhaar?', 'Registration issues'],
    authentication: ['OTP not received', 'Face verification failed', 'How to setup 2FA?'],
    elections: ['Show active elections', 'When is the next election?', 'How to view results?'],
    support: ['Create a ticket', 'Check ticket status', 'Contact admin'],
    general: ['How to vote?', 'How to register?', 'What is Triple-Lock?'],
  };
  return suggestions[category] || suggestions.general;
}
