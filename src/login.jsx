import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Intro from "./Intro.jsx";
import student_logo from './assets/students.png';
import film from './assets/film.png';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { GoogleLogin } from '@react-oauth/google';
import { supabase } from './supabaseClient.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

// Map raw Supabase auth errors to user-facing copy. The raw error is logged
// by the caller so the console keeps the real cause for diagnosis.
function otpErrorMessage(err) {
  const msg = err?.message?.toLowerCase() ?? '';
  if (err?.status === 429 || msg.includes('rate') || msg.includes('too many')) {
    return 'Too many attempts — please try again in a few minutes.';
  }
  if ((err?.status ?? 0) >= 500 || msg.includes('error sending')) {
    return "We couldn't send the email — please try again shortly.";
  }
  return 'Something went wrong. Please try again.';
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [checking, setChecking] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [logoutBanner, setLogoutBanner] = useState(location.state?.loggedOut ?? false);
  // Nonce pair stored in state so GoogleLogin re-renders with the correct hashed value.
  const [nonce, setNonce] = useState({ raw: '', hashed: '' });
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    async function generateNonce() {
      const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
      // Supabase verifies the Google ID token's nonce claim against the HEX SHA-256
      // of the raw nonce — it must be hex-encoded here, not base64.
      const hashed = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      setNonce({ raw, hashed });
    }
    generateNonce();
  }, []);

  // Redirect already-authenticated users (e.g. returning from magic link)
  useEffect(() => {
    if (!loading && user) navigate('/home', { replace: true });
  }, [user, loading]);

  // Lock body scroll while intro is showing
  useEffect(() => {
    document.body.style.overflow = introComplete ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [introComplete]);

  // Auto-dismiss logout banner after 3.5 s
  useEffect(() => {
    if (!logoutBanner) return;
    const t = setTimeout(() => setLogoutBanner(false), 3500);
    return () => clearTimeout(t);
  }, [logoutBanner]);

  // Resend OTP cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // Google — credential is signed with nonce.hashed; Supabase verifies with nonce.raw
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    const { error: authError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credentialResponse.credential,
      nonce: nonce.raw,
    });
    if (authError) setError("Google sign-in failed. Please try again.");
  };

  // Email — one flow for everyone (new and returning): send a 6-digit OTP,
  // show the code entry screen. The users table row is maintained by a DB
  // trigger on auth.users (migration 0005), not by the client.
  const emailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setOtpCode("");
    setChecking(true);

    const name = email.split('@')[0];
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { data: { name } },
    });
    if (otpError) {
      console.error('OTP send error:', otpError);
      setError(otpErrorMessage(otpError));
    } else {
      setOtpSent(true);
      setResendCooldown(60);
    }
    setChecking(false);
  };

  // Re-send a fresh OTP code (available once the 60 s cooldown expires)
  const resendOtp = async () => {
    setError('');
    const { error: otpError } = await supabase.auth.signInWithOtp({ email });
    if (otpError) {
      console.error('OTP resend error:', otpError);
      setError(otpErrorMessage(otpError));
    } else {
      setResendCooldown(60);
    }
  };

  // Verify the 6-digit code the user received by email
  const verifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'email',
    });
    if (verifyError) {
      setError("Invalid or expired code. Check the email and try again.");
      setVerifying(false);
    }
    // on success onAuthStateChange fires SIGNED_IN → navigates to /home automatically
  };

  return (
    <>
    <AnimatePresence>
      {!introComplete && <Intro onDismiss={() => setIntroComplete(true)} />}
    </AnimatePresence>

    {/* Logout toast */}
    <AnimatePresence>
      {logoutBanner && (
        <motion.div
          initial={{ opacity: 0, x: 60, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'white',
            border: '1px solid #81c784',
            borderLeft: '4px solid #2e7d32',
            borderRadius: '8px',
            padding: '0.85rem 1.25rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.875rem',
            color: '#1c1c1e',
            zIndex: 600,
            minWidth: '260px',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>✓</span>
          <div>
            <div style={{ fontWeight: 600, color: '#2e7d32', marginBottom: '0.1rem' }}>Logged out</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>You have been signed out successfully.</div>
          </div>
          <button
            onClick={() => setLogoutBanner(false)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#aaa',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="login-container">

      {/* ── Left: form panel ── */}
      <div className="login-left">

        <motion.div
          className="login-form-area"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="login-brand" style={{ marginBottom: '0.35rem' }}>RELIVE</span>
          <p className="login-sub">Course reviews by students, for students.</p>

          <AnimatePresence mode="wait">
            {otpSent ? (
              /* ── OTP code entry ── */
              <motion.div
                key="otp-sent"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--clr-navy) 0%, #3d6478 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 4px 16px rgba(42,71,89,0.22)',
                }}>
                  <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>✉</span>
                </div>
                <h2 style={{
                  fontFamily: '"Noto Serif Display", serif',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--clr-navy)',
                  margin: '0 0 0.5rem',
                }}>
                  Enter your code
                </h2>
                <p style={{
                  color: '#999',
                  fontSize: '0.875rem',
                  lineHeight: 1.65,
                  margin: '0 0 1.5rem',
                }}>
                  We sent a 6-digit code to{' '}
                  <strong style={{ color: 'var(--clr-ink)', fontWeight: 600 }}>{email}</strong>.
                  <br />Enter it below — it expires in 10 minutes.
                </p>

                <form onSubmit={verifyCode}>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '2rem',
                      fontWeight: 700,
                      letterSpacing: '0.4em',
                      fontFamily: 'monospace',
                      border: '1.5px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '0.65rem 0.5rem',
                      outline: 'none',
                      color: 'var(--clr-navy)',
                      marginBottom: '1rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--clr-navy)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e0e0e0'; }}
                    required
                  />

                  <button
                    type="submit"
                    disabled={otpCode.length < 6 || verifying}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: (otpCode.length < 6 || verifying) ? '#ccc' : 'var(--clr-red)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: (otpCode.length < 6 || verifying) ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background 0.2s',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {verifying ? 'Verifying…' : 'Sign in'}
                  </button>
                </form>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: 'var(--clr-red)', fontSize: '0.825rem', marginBottom: '0.75rem' }}
                  >
                    {error}
                  </motion.p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={resendOtp}
                    disabled={resendCooldown > 0}
                    style={{
                      background: 'none',
                      border: '1px solid #e8e8e8',
                      color: resendCooldown > 0 ? '#ccc' : '#aaa',
                      fontSize: '0.8rem',
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (resendCooldown > 0) return;
                      e.currentTarget.style.borderColor = 'var(--clr-navy)';
                      e.currentTarget.style.color = 'var(--clr-navy)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e8e8e8';
                      e.currentTarget.style.color = resendCooldown > 0 ? '#ccc' : '#aaa';
                    }}
                  >
                    {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
                  </button>

                  <button
                    onClick={() => { setOtpSent(false); setError(""); setOtpCode(""); }}
                    style={{
                      background: 'none',
                      border: '1px solid #e8e8e8',
                      color: '#aaa',
                      fontSize: '0.8rem',
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--clr-navy)'; e.currentTarget.style.color = 'var(--clr-navy)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.color = '#aaa'; }}
                  >
                    Use a different email
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── Login form ── */
              <motion.div
                key="login-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {/* GoogleLogin renders once the nonce is ready so the credential
                    is signed with the correct hashed nonce from the start. */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem', minHeight: '44px' }}>
                  {nonce.hashed ? (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Google sign-in failed. Please try again.")}
                      nonce={nonce.hashed}
                      useOneTap={false}
                      shape="rectangular"
                      size="large"
                      text="signin_with"
                      theme="outline"
                      width="360"
                    />
                  ) : (
                    <div style={{ height: '44px', width: '360px', background: '#f5f5f5', borderRadius: '4px' }} />
                  )}
                </div>

                <div className="login-divider">or</div>

                <form onSubmit={emailLogin}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email address"
                    value={email}
                    variant="outlined"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{
                      mb: 1.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                      },
                      '& .MuiInputLabel-root': { fontFamily: 'inherit', fontSize: '0.9rem' },
                    }}
                  />
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disableElevation
                    disabled={checking}
                    sx={{
                      backgroundColor: checking ? undefined : 'var(--clr-red)',
                      color: 'white',
                      textTransform: 'none',
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      py: 1.1,
                      borderRadius: '8px',
                      '&:hover': { backgroundColor: '#a93226' },
                    }}
                  >
                    {checking ? 'Sending…' : 'Continue with email'}
                  </Button>
                </form>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: 'var(--clr-red)', fontSize: '0.825rem', marginTop: '0.75rem', marginBottom: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="login-footer-text">
          "Just as books let us live other lives, RELIVE lets us learn from the real ones"
        </p>
      </div>

      {/* ── Right: visual panel ── */}
      <div className="login-right">
        <img
          src={student_logo}
          alt="Students collaborating"
          className="login-hero-img"
        />

        <img
          src={film}
          alt=""
          aria-hidden="true"
          className="login-film moveImage"
        />
      </div>

    </div>
    </>
  );
}

export default Login;
