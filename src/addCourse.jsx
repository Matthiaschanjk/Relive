import React, {useState} from "react"
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Box from '@mui/material/Box';
import Dropdown from 'react-bootstrap/Dropdown';
import CloseIcon from '@mui/icons-material/Close';
import { supabase } from './supabaseClient.js';

function AddCourses( {school}) {
const [selectedSchool, setSelectedSchool] = useState("Choose a School");
const [courseName, setCourseName] = useState("");
const [courseSchool, setCourseSchool] = useState("")
const [courseDesc, setCourseDesc] = useState("")
const [schoolError, setSchoolError] = useState(true);

let displaySchool;

if (school === "ntu") {
  displaySchool = "Nanyang Technological University";
} else if (school === "nus") {
  displaySchool = "National University of Singapore";
} else if (school === "smu") {
  displaySchool = "Singapore Management University";
} else {
  displaySchool = "add your course!"; // fallback to raw string
}

const handleSelectSchool = (school) => {
    setSelectedSchool(school);
    setSchoolError(false);
  };

function submitCourses() {
  const overlayDiv = document.querySelector(".overlay");
  const currentOpacity = window.getComputedStyle(overlayDiv).opacity;

  if (currentOpacity === "0") {
    overlayDiv.style.opacity = 0.95;
    overlayDiv.style.zIndex = 10;
  } else {
    overlayDiv.style.opacity = 0;
    overlayDiv.style.zIndex = -1;
  }
}

const addCourses = async (e) => {
  e.preventDefault();
  const {error} = await supabase
  .from("courses")
  .insert({
    school: selectedSchool,
    course: courseName,
    description: courseDesc,
    faculty: courseSchool
  })

  if (error) {
    alert('There was an error in inserting data.');
    console.error(error);
  } else {
    setCourseName("")
    setCourseSchool("")
    setCourseDesc("")
    setSelectedSchool("Choose a School")
    console.log("data inserted correctly");
    submitCourses();
    }
}

    return (
        <>
        <div className="d-flex flex-row-reverse bd-highlight mb-3">
            <Button variant="warning" size="lg" onClick={submitCourses}>Add Course</Button>
        </div>
        <Container className="overlay" sx={{
                opacity: 0,
                zIndex: -1,
                width: {
                  xs: '90%',   // Small screens
                  sm: '80%',
                  md: '70%',
                  lg: '60%',
                },
                maxWidth: 'none', 
                mx: {
                  lg: 8
                }         // Center horizontally
              }}>
            <Box sx={{ bgcolor: '#cfe8fc', height:'100vh' }}>
              <div className="overlayTitle position-relative d-flex justify-content-center align-items-center">
                <h2 className="m-0">Add a Course</h2>
                <CloseIcon className="position-absolute end-0 me-3" onClick={submitCourses} 
                sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(0.9)', 
                      opacity: 0.8,                 
                    },
                    '&:active': {
                      transform: 'scale(0.85)', 
                      opacity: 0.6,
                    },
                    }} />
              </div>
              <h3>{displaySchool}</h3>

              {/* Form Creation */}
    <Form className="mt-5">
        <Container>
            <Row>
                 <div className="d-flex justify-content-center">
                    <Row>
                    <Form.Control className="mb-3" as="textarea" placeholder="Computer Science" style={{width:'100%'}} value={courseName} onChange={(e) => setCourseName(e.target.value)} required/>
                    <Form.Control className="mb-3"as="textarea" placeholder="School of Computing" style={{width:'100%'}} value={courseSchool} onChange={(e) => setCourseSchool(e.target.value)} required/>
                        <Form.Control className="mb-3"as="textarea" rows={4} placeholder="Description of Course" style={{width:'100%'}} value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} required/>
                    </Row>
                </div>
                <Dropdown onSelect={handleSelectSchool} required>
                <Dropdown.Toggle variant="info" id="dropdown-basic">
                    {selectedSchool}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item eventKey="NUS">NUS</Dropdown.Item>
                    <Dropdown.Item eventKey="NTU">NTU</Dropdown.Item>
                    <Dropdown.Item eventKey="SMU">SMU</Dropdown.Item>
                </Dropdown.Menu>
                    </Dropdown>
                {schoolError && (
                    <div style={{ color: "red", marginTop: "5px" }}>
                        Please select a school.
                        </div>
                )}
                    </Row>
                </Container>
                <div className="d-flex justify-content-center mt-3">
                <Button type="submit" disabled={schoolError} onClick={addCourses}>
                    Submit
                </Button>
                </div>
                <span style={{fontStyle: "italic", color: "red"}}>*Adding a course is subjected to approval</span>
            </Form>
            </Box>
          </Container>
        </>
    )
}

export default AddCourses