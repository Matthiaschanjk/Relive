import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from './supabaseClient.js';
import Header from "./header.jsx";
import AddCourses from "./addCourse.jsx";
import './school-page.css';

const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/**
 * Shared editorial course directory for a single school.
 * `code` is the DB value ('NUS'|'NTU'|'SMU'), `schoolKey` the lowercase form
 * used by AddCourses, `accent` the per-school colour, `name` the masthead title.
 */
function SchoolPage({ code, schoolKey, accent, name }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showAddCourse, setShowAddCourse] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from('courses')
      .select()
      .eq('school', code)
      .eq('status', 'approved')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error(`${code} courses fetch error:`, error);
          setFetchError(error.message);
        }
        setCourses(data ?? []);
        setLoading(false);
      });
    return () => { active = false; };
  }, [code]);

  const lead      = courses[0] ?? null;
  const secondary = courses[1] ?? null;
  const grid      = courses.slice(2);

  return (
    <>
      <Header />

      <div className="sp-page" style={{ '--sp-accent': accent }}>

        <motion.div
          className="sp-masthead"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="sp-masthead-inner">
            <p className="sp-section-kicker">Course Directory</p>
            <h1 className="sp-nameplate">{name}</h1>
            <p className="sp-tagline">Browse · review · relive</p>
          </div>
        </motion.div>

        <motion.div
          className="sp-body"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <hr className="st-rule-heavy" />
            <p className="st-section-label">
              {loading
                ? 'Loading courses…'
                : `${courses.length} course${courses.length !== 1 ? 's' : ''} listed`}
            </p>
            <hr className="st-rule-light" />
          </motion.div>

          {!loading && fetchError && (
            <motion.div className="sp-empty" variants={fadeUp}>
              <p style={{ color: 'var(--clr-red)', fontWeight: 600 }}>Error loading courses</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: '#666' }}>{fetchError}</p>
            </motion.div>
          )}

          {!loading && !fetchError && courses.length === 0 && (
            <motion.div className="sp-empty" variants={fadeUp}>
              <p>No courses listed yet.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                Be the first to add one using the button below.
              </p>
            </motion.div>
          )}

          {lead && (
            <motion.div
              className={`sp-lead-area${secondary ? ' two-col' : ''}`}
              variants={stagger}
            >
              <motion.div className="sp-lead-main" variants={fadeUp}>
                {lead.faculty && <p className="st-kicker">{lead.faculty}</p>}
                <Link to={`${lead.course.toLowerCase()}`} className="sp-headline-xl">
                  {lead.course}
                </Link>
                {lead.description && <p className="sp-excerpt">{lead.description}</p>}
                <Link to={`${lead.course.toLowerCase()}`} className="sp-read-more">
                  Read reviews →
                </Link>
              </motion.div>

              {secondary && (
                <motion.div className="sp-lead-secondary" variants={fadeUp}>
                  {secondary.faculty && <p className="st-kicker">{secondary.faculty}</p>}
                  <Link to={`${secondary.course.toLowerCase()}`} className="sp-headline-lg">
                    {secondary.course}
                  </Link>
                  {secondary.description && <p className="sp-excerpt">{secondary.description}</p>}
                  <Link to={`${secondary.course.toLowerCase()}`} className="sp-read-more">
                    Read reviews →
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}

          {grid.length > 0 && (
            <>
              <hr className="st-rule-light" style={{ marginTop: 0 }} />
              <motion.div className="sp-course-grid" variants={stagger}>
                {grid.map(course => (
                  <motion.div key={course.id} className="sp-course-card" variants={fadeUp}>
                    {course.faculty && <p className="st-kicker">{course.faculty}</p>}
                    <Link to={`${course.course.toLowerCase()}`} className="sp-headline-md">
                      {course.course}
                    </Link>
                    {course.description && <p className="sp-excerpt-sm">{course.description}</p>}
                    <Link to={`${course.course.toLowerCase()}`} className="sp-read-more">
                      Reviews →
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      <motion.button
        className="sp-fab"
        style={{ '--sp-accent': accent }}
        onClick={() => setShowAddCourse(true)}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.55 }}
        aria-label="Add a course"
      >
        + Add Course
      </motion.button>

      <AddCourses school={schoolKey} open={showAddCourse} onOpenChange={setShowAddCourse} />
    </>
  );
}

export default SchoolPage;
