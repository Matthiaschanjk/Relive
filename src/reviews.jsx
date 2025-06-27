import React, { useState } from "react";
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

const allowedSchools = ["nus", "ntu", "smu"];

function Review(){
{/* States to save data and check vadiation */}
const {school, course} = useParams();
const [rating, setRating] = useState(null);
const [year, setYear] = useState(null);
const [text, setText] = useState('');
const [isValid, setIsValid] = useState(false);

  if (!allowedSchools.includes(school.toLowerCase())) {
    return <ErrorPage />;
  }

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

  const handleSubmit = () => {
    if (isValid) {
      console.log(rating, year, text);
      alert('Form submitted successfully!');
      // Add submission logic here
    } else {
      alert('Please enter more than 75 words before submitting.');
    }
  };

    return (
        <>
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
                      opacity: 0.8,                 // optional feedback
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
          
          {/* Display Reviews */}

          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 2 }}>
                <Grid size={6}>
                  <h1>test</h1>
                </Grid>
                <Grid size={6} className="d-flex flex-row-reverse">
                  <Button className="mt-1 align-self-center btn-lg reviewButton" variant="warning" onClick={submitReview}>Submit Reviews</Button>
                </Grid>
          </Grid>
  </>
    )
}

export default Review