import { useState, useRef, useEffect } from 'react';
import './TwoFactorVerify.css';

export default function TwoFactorVerify({ onVerify, loading, error }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      onVerify(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      onVerify(pasted);
    }
  };

  return (
    <div className="tfa-verify animate-fade-in-scale" id="tfa-verify-step">
      <div className="tfa-verify-icon">🔐</div>
      <h2>Two-Factor Authentication</h2>
      <p className="tfa-verify-desc">Enter the 6-digit code from Google Authenticator</p>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="tfa-digit-row" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={`tfa-digit ${digit ? 'tfa-digit-filled' : ''}`}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading}
            id={`tfa-digit-${i}`}
          />
        ))}
      </div>

      {loading && (
        <div className="tfa-verifying">
          <span className="spinner-sm" /> Verifying...
        </div>
      )}
    </div>
  );
}
