import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from './supabaseClient.js';
import Header from "./header.jsx";
import ErrorPage from "./Error.jsx";
import { useParams } from "react-router-dom";
import { useAuth } from './AuthContext.jsx';
import { getSchoolVerification } from './schoolVerify.js';
import { FaStar } from "react-icons/fa";
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TextareaWithValidation from "./textarea.jsx";
import YearSelection from "./yearselection.jsx";
import StarRate from "./starRate.jsx";
import './reviews.css';

const allowedSchools = ["nus", "ntu", "smu"];

// School accent colours — mirrors the SCHOOLS map in App.jsx.
const SCHOOL_ACCENT = { nus: '#EF7C00', ntu: '#C0272D', smu: '#1273B8' };

// Sort options for the Student Reviews list.
const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'year',   label: 'By Year' },
];

const YEAR_ORDER = { 'Year 1': 1, 'Year 2': 2, 'Year 3': 3, 'Year 4': 4, 'Graduate': 5, 'Prefer not to say': 6 };

// Recency proxy: created_at when present, else the sequential id used as the React key.
const ts = (r) => (r.created_at ? new Date(r.created_at).getTime() : (typeof r.id === 'number' ? r.id : 0));

const EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

// Read-only star row rendered in the accent colour.
function Stars({ value, size = 18, accent }) {
  const filled = Math.round(value);
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          size={size}
          color={i < filled ? accent : 'rgba(0,0,0,0.14)'}
        />
      ))}
    </>
  );
}

function Review() {
  const { school, course } = useParams();
  const { user } = useAuth();
  const [showOverlay, setShowOverlay] = useState(false);
  const [rating, setRating] = useState(null);
  const [year, setYear] = useState(null);
  const [text, setText] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [calculatedData, setCalData] = useState({});
  const [description, setDescription] = useState("");
  const [faculty, setFaculty] = useState("");
  const [allowedCourses, setAllowedCourses] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const upperCaseSchool = school.toUpperCase();
  const accent = SCHOOL_ACCENT[school.toLowerCase()] ?? '#0a1e3d';

  const toggleOverlay = () => setShowOverlay(prev => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!user) {
      setSubmitError("You must be logged in to submit a review.");
      return;
    }
    if (rating == null) {
      setSubmitError("Please give the course a star rating.");
      return;
    }
    if (!year) {
      setSubmitError("Please select which year you took this course.");
      return;
    }
    if (!isValid) {
      setSubmitError("Please enter more than 75 words before submitting.");
      return;
    }

    // Derive verified from the JWT-verified email — never trust client-supplied state
    const { verified } = getSchoolVerification(user.email);
    const { error } = await supabase
      .from('reviews')
      .insert({ school, course, year, rate: rating, review: text, verified });

    if (error) {
      if (error.code === '23505') {
        setSubmitError("You've already reviewed this course.");
      } else {
        setSubmitError("There was an error submitting the review. Please try again.");
      }
    } else {
      setSubmitSuccess("Review submitted — it'll appear once approved.");
      setRating(null);
      setYear(null);
      setText('');
      toggleOverlay();
      getReview();
    }
  };

  const getDesc = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select()
      .eq('school', upperCaseSchool)
      .ilike('course', course)
      .eq('status', 'approved');

    if (!error && data.length > 0) {
      setDescription(data[0].description);
      setFaculty(data[0].faculty ?? "");
      return data[0];
    }
    return null;
  };

  const getReview = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select()
      .eq('school', school)
      .eq('course', course)
      .eq('status', 'approved');

    if (error) {
      setSubmitError("There was an error loading reviews.");
      return;
    }

    setReviews(data);

    const n = data.length;

    let rate = 0;
    let year1 = 0, year2 = 0, year3 = 0, year4 = 0, others = 0;

    data.forEach((item) => {
      rate += item.rate;
      if (item.year === "Year 1") year1++;
      else if (item.year === "Year 2") year2++;
      else if (item.year === "Year 3") year3++;
      else if (item.year === "Year 4") year4++;
      else others++;
    });

    setCalData({
      rating: n === 0 ? 0 : rate / n,
      year1: n === 0 ? 0 : Math.round((year1 / n) * 100),
      year2: n === 0 ? 0 : Math.round((year2 / n) * 100),
      year3: n === 0 ? 0 : Math.round((year3 / n) * 100),
      year4: n === 0 ? 0 : Math.round((year4 / n) * 100),
      others: n === 0 ? 0 : Math.round((others / n) * 100),
      len: n,
    });

    return data;
  };

  const getAllowedCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('course')
      .eq('school', upperCaseSchool)
      .eq('status', 'approved');

    if (!error) {
      setAllowedCourses(data.map(c => c.course.toLowerCase()));
    }
    setDataLoaded(true);
  };

  const fetchOrGenerateSummary = async (courseReviews, courseData) => {
    setSummaryLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: {
          courseName: course,
          school: upperCaseSchool,
          reviews: courseReviews,
          description: courseData?.description ?? '',
        },
      });

      if (error) throw error;
      setAiSummary(data.summary);
    } catch {
      // Fail silently — course description still shows as fallback
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await getAllowedCourses();
      const [reviewData, courseData] = await Promise.all([getReview(), getDesc()]);
      fetchOrGenerateSummary(reviewData ?? [], courseData);
    })();
  }, []);

  // Client-side sorted view — never mutate `reviews` (it feeds calculatedData + the summary).
  // Declared before the early returns so the hook order stays stable.
  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rate - a.rate) || (ts(b) - ts(a)));
    } else if (sortBy === 'year') {
      list.sort((a, b) => ((YEAR_ORDER[a.year] ?? 99) - (YEAR_ORDER[b.year] ?? 99)) || (ts(b) - ts(a)));
    } else {
      list.sort((a, b) => ts(b) - ts(a));
    }
    return list;
  }, [reviews, sortBy]);

  if (!dataLoaded) {
    return (
      <>
        <Header />
        <div className="rv-loading">Loading…</div>
      </>
    );
  }

  if (!allowedSchools.includes(school.toLowerCase()) || !allowedCourses.includes(course.toLowerCase())) {
    return <ErrorPage />;
  }

  const n = calculatedData.len ?? 0;
  const distribution = [
    { label: 'Year 1', pct: calculatedData.year1 ?? 0 },
    { label: 'Year 2', pct: calculatedData.year2 ?? 0 },
    { label: 'Year 3', pct: calculatedData.year3 ?? 0 },
    { label: 'Year 4', pct: calculatedData.year4 ?? 0 },
    { label: 'Other',  pct: calculatedData.others ?? 0 },
  ];
  const canSubmit = isValid && rating != null && !!year;

  return (
    <>
      <Header />

      <div className="rv-page" style={{ '--rv-accent': accent }}>

        {/* ── Masthead ── */}
        <motion.div
          className="rv-masthead"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="rv-masthead-inner">
            <p className="rv-section-kicker">Course Review · {upperCaseSchool}</p>
            <h1 className="rv-nameplate">{course}</h1>
            <p className="rv-tagline">{faculty || 'Browse · review · relive'}</p>
          </div>
        </motion.div>

        {/* ── Body ── */}
        <motion.div
          className="rv-body"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >

          {/* Standfirst — AI summary / course lead */}
          <motion.div variants={fadeUp}>
            <hr className="st-rule-heavy" />
            <p className="st-section-label">Editor's Note</p>
            <hr className="st-rule-light" />

            {summaryLoading ? (
              <p className="rv-standfirst rv-standfirst--muted">Generating summary…</p>
            ) : aiSummary ? (
              <>
                <p className="rv-standfirst rv-standfirst--drop">{aiSummary}</p>
                <p className="rv-byline">
                  <AutoAwesomeIcon sx={{ fontSize: '0.85rem' }} />
                  AI-generated · {n === 0 ? 'based on course info' : `based on ${n} review${n > 1 ? 's' : ''}`}
                </p>
              </>
            ) : (
              <p className="rv-standfirst rv-standfirst--drop">{description}</p>
            )}
          </motion.div>

          {/* By The Numbers */}
          <motion.div variants={fadeUp} style={{ marginTop: '2.75rem' }}>
            <hr className="st-rule-heavy" />
            <p className="st-section-label">By The Numbers</p>
            <hr className="st-rule-light" />

            <div className="rv-stats">
              <div className="rv-stat-block">
                <p className="st-kicker">Overall Rating</p>
                <div className="rv-stat-num">
                  {(Number(calculatedData.rating) || 0).toFixed(1)}<span>/5</span>
                </div>
                <div className="rv-stars">
                  <Stars value={Number(calculatedData.rating) || 0} size={20} accent={accent} />
                </div>
                <p className="rv-stat-cap">
                  {n === 0 ? 'No ratings yet' : `${n} rating${n > 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="rv-stat-block rv-stats-divider">
                <p className="st-kicker">Who Reviewed</p>
                {distribution.map((d) => (
                  <div className="rv-dist-row" key={d.label}>
                    <span className="rv-dist-label">{d.label}</span>
                    <span className="rv-dist-bar">
                      <motion.span
                        className="rv-dist-fill"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: d.pct / 100 }}
                        transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
                      />
                    </span>
                    <span className="rv-dist-pct">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Student Reviews */}
          <motion.div variants={fadeUp} style={{ marginTop: '2.75rem' }}>
            <hr className="st-rule-heavy" />
            <div className="rv-section-head">
              <p className="st-section-label">
                {n === 0 ? 'Student Reviews' : `${n} Student Review${n > 1 ? 's' : ''}`}
              </p>
              {reviews.length > 1 && (
                <div className="rv-sort">
                  <span className="rv-sort-cap">Sort</span>
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className={`rv-sort-btn${sortBy === s.key ? ' is-active' : ''}`}
                      aria-pressed={sortBy === s.key}
                      onClick={() => setSortBy(s.key)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <hr className="st-rule-light" />
          </motion.div>

          {!reviews || reviews.length === 0 ? (
            <motion.p className="rv-empty" variants={fadeUp}>
              No reviews yet.<br />
              Be the first — use the button below to write one.
            </motion.p>
          ) : (
            <motion.div variants={stagger}>
              {sortedReviews.map((item) => (
                <motion.div className="rv-review" key={item.id} variants={fadeUp}>
                  <div className="rv-review-stars">
                    <Stars value={item.rate} size={16} accent={accent} />
                  </div>
                  <p className="rv-review-body">{item.review}</p>
                  <div className="rv-review-foot">
                    <span className="rv-review-year">{item.year}</span>
                    {item.verified && (
                      <span className="rv-verified">
                        <VerifiedUserIcon sx={{ fontSize: '0.85rem' }} /> Verified Student
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Write a Review — FAB ── */}
      <motion.button
        className="rv-fab"
        style={{ '--rv-accent': accent }}
        onClick={toggleOverlay}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.55 }}
        aria-label="Write a review"
      >
        + Write a Review
      </motion.button>

      {/* ── Slide-in form overlay ── */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="overlay"
            style={{ zIndex: 100, '--rv-accent': accent }}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {/* Header */}
            <div className="rv-overlay-head">
              <div>
                <p className="rv-overlay-kicker">{upperCaseSchool} · {course}</p>
                <h2 className="rv-overlay-title">Write a Review</h2>
              </div>
              <CloseIcon
                onClick={toggleOverlay}
                sx={{ cursor: 'pointer', color: 'white', '&:hover': { opacity: 0.7 } }}
              />
            </div>

            {/* Body */}
            <div className="rv-overlay-body">

              {/* Verification banner */}
              <div
                className="rv-verify-banner"
                style={{
                  background: user?.verified ? '#eef5ee' : '#fbf6e7',
                  border: `1px solid ${user?.verified ? accent : '#d8c79a'}`,
                  color: user?.verified ? '#2e5d34' : '#6f5a1f',
                }}
              >
                {user?.verified
                  ? <><VerifiedUserIcon sx={{ fontSize: '1rem' }} /> Verified {user.school} student — your review will carry a verified badge</>
                  : <><InfoOutlinedIcon sx={{ fontSize: '1rem' }} /> Sign in with your school email to get a verified badge on your review</>
                }
              </div>

              {/* Year + Rating */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <p className="rv-field-label">Which year are you in?</p>
                  <YearSelection onSelect={setYear} />
                </div>
                <div>
                  <p className="rv-field-label">Rate the course</p>
                  <StarRate onRate={setRating} />
                </div>
              </div>

              {/* Textarea */}
              <TextareaWithValidation onChange={setText} onValidChange={setIsValid} />

              {/* Feedback messages */}
              {submitError && (
                <p style={{ color: 'var(--clr-red)', fontSize: '0.85rem', marginTop: '0.75rem' }}>{submitError}</p>
              )}
              {submitSuccess && (
                <p style={{ color: '#2e7d32', fontSize: '0.85rem', marginTop: '0.75rem' }}>{submitSuccess}</p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="rv-submit"
                style={{
                  background: canSubmit ? accent : '#c9c4b8',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                Submit Review
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Review;
