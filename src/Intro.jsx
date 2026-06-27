import { useEffect } from "react";
import { motion } from "framer-motion";

const LETTERS = "RELIVE".split("");

export default function Intro({ onDismiss }) {
  useEffect(() => {
    const handle = () => onDismiss();
    window.addEventListener('wheel',     handle, { once: true, passive: true });
    window.addEventListener('touchmove', handle, { once: true, passive: true });
    window.addEventListener('keydown',   handle, { once: true });
    return () => {
      window.removeEventListener('wheel',     handle);
      window.removeEventListener('touchmove', handle);
      window.removeEventListener('keydown',   handle);
    };
  }, [onDismiss]);

  return (
    <motion.div
      exit={{ y: '-100%' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0b1623',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Subtle editorial grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
        pointerEvents: 'none',
      }} />

      {/* Corner marks — editorial registration marks */}
      {[
        { top: '1.5rem', left: '1.5rem' },
        { top: '1.5rem', right: '1.5rem' },
        { bottom: '1.5rem', left: '1.5rem' },
        { bottom: '1.5rem', right: '1.5rem' },
      ].map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.18 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            border: '1px solid rgba(255,255,255,0.6)',
            ...pos,
          }}
        />
      ))}

      {/* RELIVE — letter-by-letter clip reveal */}
      <div style={{ display: 'flex', position: 'relative' }}>
        {LETTERS.map((letter, i) => (
          <div key={i} style={{ overflow: 'hidden', lineHeight: 1 }}>
            <motion.span
              initial={{ y: '108%' }}
              animate={{ y: 0 }}
              transition={{
                delay: 0.1 + i * 0.08,
                duration: 0.78,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                display: 'inline-block',
                fontFamily: '"Noto Serif Display", serif',
                fontSize: 'clamp(4.5rem, 13vw, 10rem)',
                fontWeight: 700,
                color: 'white',
                letterSpacing: '0.14em',
                lineHeight: 1,
              }}
            >
              {letter}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Red rule — scales from left */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.72, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 'clamp(260px, 52vw, 640px)',
          height: '2px',
          background: '#c0392b',
          transformOrigin: 'left',
          marginTop: '0.45rem',
          marginBottom: '0.6rem',
        }}
      />

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.42, y: 0 }}
        transition={{ delay: 1.1, duration: 0.55 }}
        style={{
          color: 'white',
          fontSize: '0.7rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          fontFamily: '"Noto Serif", serif',
          margin: 0,
        }}
      >
        Course reviews · Singapore universities
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9, duration: 0.6 }}
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.45rem',
          color: 'rgba(255,255,255,0.25)',
          fontSize: '0.62rem',
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
        }}
      >
        <span>Scroll to continue</span>
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.1 }}
          style={{ fontSize: '0.85rem', color: 'rgba(192,57,43,0.7)' }}
        >
          ↓
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
