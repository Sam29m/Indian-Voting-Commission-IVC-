import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Nav
    home: 'Home', login: 'Login', register: 'Register', logout: 'Logout',
    dashboard: 'Dashboard', elections: 'Elections', voting: 'Voting',
    support: 'Support', mitra: 'Mitra AI', settings: 'Settings',
    // Auth
    loginTitle: 'Login to IVC', registerTitle: 'Create Account',
    email: 'Email Address', password: 'Password', phone: 'Phone Number',
    name: 'Full Name', sendOtp: 'Send OTP', verifyOtp: 'Verify OTP',
    enterOtp: 'Enter 6-digit OTP', aadhaarNumber: 'Aadhaar Number',
    verifyAadhaar: 'Verify Aadhaar', faceVerify: 'Face Verification',
    step: 'Step',
    // Dashboard
    voterDashboard: 'Voter Dashboard', candidateDashboard: 'Candidate Dashboard',
    adminDashboard: 'Admin Dashboard', totalElections: 'Total Elections',
    activeElections: 'Active Elections', votesPlaced: 'Votes Placed',
    totalUsers: 'Total Users', openTickets: 'Open Tickets',
    // Elections
    castVote: 'Cast Vote', viewResults: 'View Results',
    electionActive: 'Active', electionUpcoming: 'Upcoming',
    electionCompleted: 'Completed', electionDraft: 'Draft',
    candidates: 'Candidates', voteConfirm: 'Confirm Vote',
    // General
    welcome: 'Welcome', loading: 'Loading...', error: 'Error',
    success: 'Success', submit: 'Submit', cancel: 'Cancel',
    back: 'Back', next: 'Next', save: 'Save',
    indianVotingCommission: 'Indian Voting Commission',
    tagline: 'Secure, Transparent, Democratic',
    tripleLock: 'Triple-Lock Authentication',
    // Mitra
    mitraWelcome: 'Hello! I\'m Mitra, your IVC assistant. How can I help?',
    askMitra: 'Ask Mitra...',
  },
  hi: {
    home: 'होम', login: 'लॉगिन', register: 'पंजीकरण', logout: 'लॉगआउट',
    dashboard: 'डैशबोर्ड', elections: 'चुनाव', voting: 'मतदान',
    support: 'सहायता', mitra: 'मित्र AI', settings: 'सेटिंग्स',
    loginTitle: 'IVC में लॉगिन करें', registerTitle: 'खाता बनाएं',
    email: 'ईमेल पता', password: 'पासवर्ड', phone: 'फ़ोन नंबर',
    name: 'पूरा नाम', sendOtp: 'OTP भेजें', verifyOtp: 'OTP सत्यापित करें',
    enterOtp: '6 अंकों का OTP दर्ज करें', aadhaarNumber: 'आधार नंबर',
    verifyAadhaar: 'आधार सत्यापित करें', faceVerify: 'चेहरा सत्यापन',
    step: 'चरण',
    voterDashboard: 'मतदाता डैशबोर्ड', candidateDashboard: 'उम्मीदवार डैशबोर्ड',
    adminDashboard: 'व्यवस्थापक डैशबोर्ड', totalElections: 'कुल चुनाव',
    activeElections: 'सक्रिय चुनाव', votesPlaced: 'डाले गए वोट',
    totalUsers: 'कुल उपयोगकर्ता', openTickets: 'खुले टिकट',
    castVote: 'वोट दें', viewResults: 'परिणाम देखें',
    electionActive: 'सक्रिय', electionUpcoming: 'आगामी',
    electionCompleted: 'पूर्ण', electionDraft: 'ड्राफ़्ट',
    candidates: 'उम्मीदवार', voteConfirm: 'वोट की पुष्टि करें',
    welcome: 'स्वागत है', loading: 'लोड हो रहा है...', error: 'त्रुटि',
    success: 'सफल', submit: 'जमा करें', cancel: 'रद्द करें',
    back: 'वापस', next: 'अगला', save: 'सहेजें',
    indianVotingCommission: 'भारतीय मतदान आयोग',
    tagline: 'सुरक्षित, पारदर्शी, लोकतांत्रिक',
    tripleLock: 'ट्रिपल-लॉक प्रमाणीकरण',
    mitraWelcome: 'नमस्ते! मैं मित्र हूँ, आपका IVC सहायक। कैसे मदद कर सकता हूँ?',
    askMitra: 'मित्र से पूछें...',
  },
  ta: {
    home: 'முகப்பு', login: 'உள்நுழை', register: 'பதிவு', logout: 'வெளியேறு',
    dashboard: 'டாஷ்போர்டு', elections: 'தேர்தல்கள்', voting: 'வாக்களிப்பு',
    support: 'ஆதரவு', mitra: 'மித்ரா AI', settings: 'அமைப்புகள்',
    loginTitle: 'IVC இல் உள்நுழையுங்கள்', registerTitle: 'கணக்கை உருவாக்கு',
    email: 'மின்னஞ்சல்', password: 'கடவுச்சொல்', phone: 'தொலைபேசி',
    name: 'முழு பெயர்', sendOtp: 'OTP அனுப்பு', verifyOtp: 'OTP சரிபார்',
    enterOtp: '6 இலக்க OTP உள்ளிடவும்', aadhaarNumber: 'ஆதார் எண்',
    verifyAadhaar: 'ஆதார் சரிபார்', faceVerify: 'முக சரிபார்ப்பு',
    step: 'படி',
    voterDashboard: 'வாக்காளர் டாஷ்போர்டு', candidateDashboard: 'வேட்பாளர் டாஷ்போர்டு',
    adminDashboard: 'நிர்வாகி டாஷ்போர்டு', totalElections: 'மொத்த தேர்தல்கள்',
    activeElections: 'செயலில் தேர்தல்கள்', votesPlaced: 'போடப்பட்ட வாக்குகள்',
    totalUsers: 'மொத்த பயனர்கள்', openTickets: 'திறந்த டிக்கெட்கள்',
    castVote: 'வாக்களியுங்கள்', viewResults: 'முடிவுகளைக் காண',
    electionActive: 'செயலில்', electionUpcoming: 'வரவிருக்கும்',
    electionCompleted: 'முடிந்தது', electionDraft: 'வரைவு',
    candidates: 'வேட்பாளர்கள்', voteConfirm: 'வாக்கை உறுதிப்படுத்து',
    welcome: 'வரவேற்கிறோம்', loading: 'ஏற்றுகிறது...', error: 'பிழை',
    success: 'வெற்றி', submit: 'சமர்ப்பி', cancel: 'ரத்து',
    back: 'பின்செல்', next: 'அடுத்து', save: 'சேமி',
    indianVotingCommission: 'இந்திய வாக்குச் சீட்டு ஆணையம்',
    tagline: 'பாதுகாப்பான, வெளிப்படையான, ஜனநாயக',
    tripleLock: 'ட்ரிபிள்-லாக் அங்கீகாரம்',
    mitraWelcome: 'வணக்கம்! நான் மித்ரா, உங்கள் IVC உதவியாளர்.',
    askMitra: 'மித்ராவிடம் கேளுங்கள்...',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('ivc_lang') || 'en');

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('ivc_lang', newLang);
  };

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t, languages: ['en', 'hi', 'ta'] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
