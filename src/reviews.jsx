import React, { useState, useEffect } from "react";
import { supabase } from './supabaseClient.js';
import Header from "./header.jsx";
import reviewcourse from "./assets/reviewcourses.jpg";
import ErrorPage from "./Error.jsx";
import { useParams } from "react-router-dom";
import Box from '@mui/material/Box';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Grid from '@mui/material/Grid';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from '@mui/material/Container';
import CloseIcon from '@mui/icons-material/Close';
import Form from 'react-bootstrap/Form';
import TextareaWithValidation from "./textarea.jsx";
import YearSelection from "./yearselection.jsx";
import StarRate from "./starRate.jsx";
import Rating from '@mui/material/Rating';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarBorderPurple500Icon from '@mui/icons-material/StarBorderPurple500';
import ProgressBar from 'react-bootstrap/ProgressBar';
import AddchartIcon from '@mui/icons-material/Addchart';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

//global Variables
const allowedSchools = ["nus", "ntu", "smu"];

function Review(){
{/* States to save data and check vadiation */}
const {school, course} = useParams();
const [rating, setRating] = useState(null);
const [year, setYear] = useState(null);
const [text, setText] = useState('');
const [isValid, setIsValid] = useState(false);
const [reviews, setReviews] = useState([]);
const [calculatedData, setCalData] = useState([]);
const [description, setDescription] = useState("");
const upperCaseSchool = school.toUpperCase();
const [allowedCourses, setAllowedCourses] = useState([]);
const [dataLoaded, setDataLoaded] = useState(false);

function submitReview() {
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

const handleSubmit = async (e) => {
  e.preventDefault();
  if (isValid) {
    const { error } = await supabase
      .from('reviews')
      .insert({
        school: school,
        course: course,
        year: year,
        rate: rating,
        review: text,
      });

    if (error) {
      console.error('Error inserting review:', error);
      alert('There was an error submitting the form.');
    } else {
      console.log(rating, year, text);
      alert('Form submitted successfully!');
      setRating(0);
      setYear('');
      setText('');
       location.reload(true);
    }
  } else {
    alert('Please enter more than 75 words before submitting.');
  }
};

{/* function that draws reviews data */}
const getDesc = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select()
    .eq('school', upperCaseSchool)
    .ilike('course', `%${course}%`);

  if (error) {
    alert('There was an error in drawing data.');
    console.error(error);
  } else {
    setDescription(data[0].description); // update description
    console.log(allowedCourses)
    console.log("data received correctly");
}}

{/* function that draws reviews data */}
const getReview = async () => {
  const { data, error } = await supabase
    .from('reviews')
    .select()
    .eq('school', school)
    .eq('course', course);

  if (error) {
    alert('There was an error in drawing data.');
    console.error(error);
  } else {
    setReviews(data); // update state

    // calculate directly from data (instead of waiting for reviews state)
    let rate = 0;
    let n = 0;
    let year1 = 0;
    let year2 = 0;
    let year3 = 0;
    let year4 = 0;
    let others = 0;
    data.forEach((item) => {
      rate += item.rate;
      n++;
      if (item.year == "Year 1") {
        year1++;
      } else if (item.year == "Year 2") {
        year2++;
      } else if (item.year == "Year 3") {
        year3++;
      } else if (item.year == "Year 4") {
        year4++;
      } else {
        others++;
      }
    });
    const average = n === 0 ? 0 : rate / n;
    setCalData({ 
      rating: average,
      year1 : year1 * 100,
      year2 : year2 * 100,
      year3 : year3 * 100,
      year4 : year4 * 100,
      others : others * 100,
      len : n
    });
    console.log("Calculated average rating:", average);
  }
}

//append courses inside the database into setAllowedCourses
const getAllowedCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('course')
    .eq('school', upperCaseSchool);

  if (error) {
    alert('There was an error in drawing data.');
    console.error(error);
  } else {
    const newCourses = data.map(c => c.course.toLowerCase());
    setAllowedCourses(newCourses);
    console.log(allowedCourses)
  }

  setDataLoaded(true);
};


{/* Functions that will load the moment the page opens */}
useEffect(() => {
  getAllowedCourses();
  getReview();
  getDesc();
}, []);

if (!dataLoaded) {
  return <div>Loading....</div>
}

  if (!allowedSchools.includes(school.toLowerCase()) || !allowedCourses.includes(course.toLowerCase())) {
    return <ErrorPage />;
  }

    return (
        <div style={{maxWidth: "1350px", margin: "0 auto", padding: "1rem" }}>
        <Header />
        <Box sx={{ width: '100%', height: 250, overflow: 'hidden', position: 'relative' }}>
          <img
            src={reviewcourse}
            alt={course}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            />
          <ImageListItemBar className="imageText"
            title={course}
            subtitle={<span>{school}</span>}
            position="bottom"
          />
          </Box>
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
                <h2 className="m-0">Submit Review</h2>
                <CloseIcon className="position-absolute end-0 me-3" onClick={submitReview} 
                sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(0.9)',      // "press" effect
                      opacity: 0.8,                 
                    },
                    '&:active': {
                      transform: 'scale(0.85)',     // actual click press
                      opacity: 0.6,
                    },
                    }} />
              </div>
              <h3>{`${school.toUpperCase()}`} {course}</h3>

              {/* Form Creation */}
              <Form className="mt-5">
              <Container>
                <Row>
                  <Col sm={6} md={6} lg={6}><YearSelection onSelect={setYear} /></Col>
                  <Col sm={6} md={6} lg={6}><StarRate onRate={setRating} /></Col>
                </Row>
              </Container>
                <TextareaWithValidation onChange={setText} onValidChange={setIsValid} />
                <div className="d-flex justify-content-center mt-3">
                  <Button type="submit" onClick={handleSubmit} disabled={!isValid}>
                    Submit
                  </Button>
            </div>
            </Form>
            </Box>
          </Container>
          
  {/* Display Summary Table */}
<Grid container columnSpacing={{ xs: 1, sm: 1, md: 2 }}>
  <Grid item xs={12}   
  sx={{
    maxWidth: '1100px',  // Limit the max width
    width: '100%',      // Let it scale on smaller screens
  }} className="mt-2">
    <Box sx={{ border: '1px groove #ccc', padding: '16px', mt: 5 }}>
      <h2>Summary of Reviews <AutoAwesomeIcon /></h2>
      <span style={{whiteSpace: "pre-wrap", fontWeight: "light"}}>
       {description}
      </span>

      <h3 className="mt-3" style={{ fontSize: 'larger', fontWeight: 'bold' }}>
        Overall Course Rating <StarBorderPurple500Icon />
      </h3>
      <Rating name="read-only" size="large" value={Number(calculatedData.rating) || 0} readOnly />

      <h3 className="mt-3" style={{ fontSize: 'larger', fontWeight: 'bold' }}>
        Review Demographics <AddchartIcon />
      </h3>
      <ProgressBar>
        <ProgressBar striped variant="success" now={calculatedData.year1} key={1} />
        <ProgressBar striped variant="warning" now={calculatedData.year2} key={2} />
        <ProgressBar striped variant="info" now={calculatedData.year3} key={3} />
        <ProgressBar striped variant="primary" now={calculatedData.year4} key={4} />
        <ProgressBar striped variant="danger" now={calculatedData.others} key={5} />
      </ProgressBar>

      <Grid container spacing={2} className="mt-5">
        {[
          { color: '#198754', label: 'Year 1' },
          { color: '#ffc107', label: 'Year 2' },
          { color: '#0dcaf0', label: 'Year 3' },
          { color: '#0d6efd', label: 'Year 4' },
          { color: '#dc3545', label: 'Prefer not to say' },
        ].map((item, index) => (
          <Grid item xs={2} key={index}>
            <div className="legendColour" style={{ backgroundColor: item.color }} />
            <span> {item.label}</span>
          </Grid>
        ))}
      </Grid>
    </Box>
  </Grid>

  {/* Button */}
  <Grid item xs={2} className="d-flex flex-row-reverse">
    <Button className="mt-5 btn-lg reviewButton" type="button" variant="warning" onClick={submitReview}>
      Submit Reviews
    </Button>
  </Grid>
</Grid>

  {/* Display reviews */}
  <h2 className="mt-5">Browse {calculatedData.len} student Reviews</h2>
  <hr></hr>
  {!reviews || reviews.length === 0? (
    <span style={{ fontSize: "1.2rem", fontStyle: "italic" }}>
      No reviews yet, press button at the top to add one.
  </span>
  ) : (
  reviews.map((item, index) => (
  <div>
    <Rating name="read-only" size="large" value={item.rate} readOnly />
      <div id="reviewDiv">
      <span style={{fontSize: "1.1rem", textAlign: "justify", whiteSpace: "pre-wrap"}}>
          {item.review}
      </span>
      <div className="mt-2" style={{textAlign: "right"}}>
        <h3 style={{ color: "#ff9500", fontWeight: "bold", margin: 0 }}>{item.year}</h3>
        <h3 style={{ color: "#0d6efd", fontWeight: "bolder", margin: 0 }}><VerifiedUserIcon /> Verified User</h3>
      </div>
    </div>
    <hr></hr>
  </div>
  ))
  )}
  
  
</div>
    )
}

export default Review