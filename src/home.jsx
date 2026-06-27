import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "./header.jsx";
import { supabase } from './supabaseClient.js';
import './home.css';

const schools = [
  {
    abbr: 'NUS',
    name: 'National University of Singapore',
    path: '/nus',
    section: 'Section A',
    accent: '#EF7C00',
    body: 'The national research university on Kent Ridge, formed in 1980 from the union of the University of Singapore and Nanyang University. Its course list is the deepest of the three.',
  },
  {
    abbr: 'NTU',
    name: 'Nanyang Technological University',
    path: '/ntu',
    section: 'Section B',
    accent: '#C0272D',
    body: 'The technological university out at Jurong, founded in 1981 and built around engineering, the sciences and, more recently, the arts and humanities.',
  },
  {
    abbr: 'SMU',
    name: 'Singapore Management University',
    path: '/smu',
    section: 'Section C',
    accent: '#1273B8',
    body: 'The city-campus university downtown, founded in 2000 on a seminar-style model after the Wharton School. Smaller cohorts, sharper discussion.',
  },
];

const EASE = [0.16, 1, 0.3, 1]; // ease-out-expo

// rule draws out from a point; nameplate letters lift in sequence
const ruleVariant = {
  hidden:  { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.9, ease: EASE } },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.15 } },
};

const charVariant = {
  hidden:  { y: '60%', opacity: 0 },
  visible: { y: '0%', opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

const colStagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.35 } },
};

const colVariant = {
  hidden:  { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

function Home() {
  const [counts, setCounts] = useState(null); // { NUS: n, NTU: n, SMU: n }

  // live "circulation": approved course count per school
  useEffect(() => {
    let active = true;
    supabase
      .from('courses')
      .select('school')
      .eq('status', 'approved')
      .then(({ data, error }) => {
        if (!active || error || !data) return;
        const tally = data.reduce((acc, r) => {
          acc[r.school] = (acc[r.school] ?? 0) + 1;
          return acc;
        }, {});
        setCounts(tally);
      });
    return () => { active = false; };
  }, []);

  const today = new Date().toLocaleDateString('en-SG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const year = new Date().getFullYear();

  return (
    <>
      <Header />

      <div className="fp">
        <div className="fp-sheet">

          {/* ── Masthead ── */}
          <motion.div className="fp-rule fp-rule--hair" variants={ruleVariant} initial="hidden" animate="visible" />

          <motion.div
            className="fp-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          >
            <span>Singapore Edition</span>
            <span className="fp-meta-center">Course Reviews · Vol. {year}</span>
            <span>{today}</span>
          </motion.div>

          <motion.div className="fp-rule" variants={ruleVariant} initial="hidden" animate="visible" />

          <div className="fp-nameplate">
            <motion.h1
              className="fp-wordmark"
              variants={stagger}
              initial="hidden"
              animate="visible"
              aria-label="Relive"
            >
              {'RELIVE'.split('').map((ch, i) => (
                <motion.span key={i} className="fp-ch" variants={charVariant} aria-hidden="true">
                  {ch}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p
              className="fp-strap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
            >
              Course reviews by students, for students.
            </motion.p>
          </div>

          <motion.div className="fp-rule fp-rule--heavy" variants={ruleVariant} initial="hidden" animate="visible" />
          <motion.div
            className="fp-rule fp-rule--hair"
            style={{ marginTop: '3px' }}
            variants={ruleVariant}
            initial="hidden"
            animate="visible"
          />

          {/* ── Front-page lead ── */}
          <motion.p
            className="fp-lead"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
          >
            Three campuses, one shared margin of notes. Pick a masthead below to read what
            students wrote about the lectures, tutorials and late nights that shaped them.
          </motion.p>

          {/* ── School columns ── */}
          <motion.div
            className="fp-columns"
            variants={colStagger}
            initial="hidden"
            animate="visible"
          >
            {schools.map((s, i) => {
              const n = counts?.[s.abbr];
              return (
                <motion.div key={s.abbr} variants={colVariant} style={{ display: 'flex' }}>
                  <Link
                    to={s.path}
                    className={`fp-col${i === 0 ? ' fp-col--lead' : ''}`}
                    style={{ '--fp-accent': s.accent, flex: 1 }}
                  >
                    <div className="fp-col-head">
                      <span className="fp-col-mark" />
                      <span className="fp-col-section">{s.section}</span>
                    </div>
                    <h2 className="fp-col-abbr">{s.abbr}</h2>
                    <p className="fp-col-name">{s.name}</p>
                    <p className="fp-col-body">{s.body}</p>
                    <div className="fp-col-foot">
                      <span className="fp-col-circ">
                        {n === undefined
                          ? '— listed'
                          : `${n} course${n === 1 ? '' : 's'} listed`}
                      </span>
                      <span className="fp-col-enter">
                        Enter the directory <span className="fp-arrow">→</span>
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── Footer ── */}
          <motion.div className="fp-rule fp-rule--hair" style={{ marginTop: '1.5rem' }} variants={ruleVariant} initial="hidden" animate="visible" />
          <motion.div
            className="fp-foot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.9 }}
          >
            <p className="fp-foot-quote">
              "Just as books let us live other lives, Relive lets us learn from the real ones."
            </p>
            <span className="fp-foot-page">Page One</span>
          </motion.div>

        </div>
      </div>
    </>
  );
}

export default Home;
