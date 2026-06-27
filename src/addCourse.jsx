import { useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import CloseIcon from '@mui/icons-material/Close';
import { supabase } from './supabaseClient.js';
import { useAuth } from './AuthContext.jsx';
import { motion, AnimatePresence } from "framer-motion";

const displaySchoolMap = {
  ntu: "Nanyang Technological University",
  nus: "National University of Singapore",
  smu: "Singapore Management University",
};

function AddCourses({ school, open: openProp, onOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("Choose a School");
  const [courseName, setCourseName] = useState("");
  const [courseSchool, setCourseSchool] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [schoolError, setSchoolError] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const { user } = useAuth();
  const isControlled = openProp !== undefined;
  const showOverlay = isControlled ? openProp : internalOpen;
  const displaySchool = displaySchoolMap[school] ?? "Add your course!";

  const toggleOverlay = () => {
    if (isControlled) onOpenChange?.(!openProp);
    else setInternalOpen(prev => !prev);
  };

  const handleSelectSchool = (value) => {
    setSelectedSchool(value);
    setSchoolError(false);
  };

  const addCourses = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!user) {
      setSubmitError("You must be logged in to add a course.");
      return;
    }

    // status is forced to 'pending' server-side by a trigger — admins approve it.
    const { error } = await supabase
      .from("courses")
      .insert({ school: selectedSchool, course: courseName, description: courseDesc, faculty: courseSchool });

    if (error) {
      setSubmitError("There was an error submitting the course. Please try again.");
    } else {
      setCourseName("");
      setCourseSchool("");
      setCourseDesc("");
      setSelectedSchool("Choose a School");
      setSchoolError(true);
      setSubmitSuccess("Course submitted — it'll appear once approved.");
    }
  };

  return (
    <>
      {!isControlled && (
        <div className="d-flex flex-row-reverse bd-highlight mb-3">
          <Button variant="warning" size="lg" onClick={toggleOverlay}>Add Course</Button>
        </div>
      )}

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="overlay"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{ zIndex: 100 }}
          >
            {/* Header */}
            <div className="overlayTitle" style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}>
              <div>
                <h2 className="m-0" style={{ color: 'white', fontSize: '1.4rem' }}>Add a Course</h2>
                <span style={{ fontSize: '0.75rem', opacity: 0.7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {displaySchool}
                </span>
              </div>
              <CloseIcon
                onClick={toggleOverlay}
                sx={{ cursor: 'pointer', color: 'white', '&:hover': { opacity: 0.7 } }}
              />
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem 1.5rem 2rem' }}>
              <Form onSubmit={addCourses}>
                <Form.Control
                  className="mb-3"
                  type="text"
                  placeholder="Course Name (e.g. Computer Science)"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                />
                <Form.Control
                  className="mb-3"
                  type="text"
                  placeholder="Faculty (e.g. School of Computing)"
                  value={courseSchool}
                  onChange={(e) => setCourseSchool(e.target.value)}
                  required
                />
                <Form.Control
                  className="mb-3"
                  as="textarea"
                  rows={4}
                  placeholder="Description of Course"
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  required
                />

                <Dropdown onSelect={handleSelectSchool} className="mb-2">
                  <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                    {selectedSchool}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="NUS">NUS</Dropdown.Item>
                    <Dropdown.Item eventKey="NTU">NTU</Dropdown.Item>
                    <Dropdown.Item eventKey="SMU">SMU</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {schoolError && (
                  <p style={{ color: 'var(--clr-red)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                    Please select a school.
                  </p>
                )}

                {submitError && (
                  <p style={{ color: 'var(--clr-red)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    {submitError}
                  </p>
                )}

                {submitSuccess && (
                  <p style={{ color: '#2e7d32', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    {submitSuccess}
                  </p>
                )}

                <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: '#999', marginBottom: '1rem' }}>
                  * Submitted courses are reviewed before they appear in the directory. Please double-check the details.
                </p>

                <button
                  type="submit"
                  disabled={schoolError}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: schoolError ? '#ccc' : 'var(--clr-red)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: schoolError ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.2s',
                  }}
                >
                  Submit Course
                </button>
              </Form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AddCourses;
