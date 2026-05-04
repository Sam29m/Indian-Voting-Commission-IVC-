import React, { useState } from 'react';

const AadhaarAuth = ({ onVerified, error: externalError }) => {
  const [aadhaar, setAadhaar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(aadhaar)) {
      setError('Aadhaar must be exactly 12 digits.');
      return;
    }
    setError('');
    onVerified(aadhaar);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">Please enter your 12-digit Aadhaar number for identity verification.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="XXXX XXXX XXXX"
            className="w-full p-4 border rounded-xl text-center text-xl font-mono tracking-[0.5em] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            required
          />
        </div>
        
        {(error || externalError) && (
          <p className="text-xs text-red-500 text-center">{error || externalError}</p>
        )}

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-orange-700 shadow-lg transition-all active:scale-95"
        >
          Verify Aadhaar
        </button>
      </form>

      <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.616.92v5.335c0 5.163-3.007 9.802-7.834 11.52a1 1 0 01-.632 0C5.173 20.957 2.166 16.318 2.166 11.155V5.82a1 1 0 01.616-.92zM10 13a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
        <span>Secure Identity Layer</span>
      </div>
    </div>
  );
};

export default AadhaarAuth;
