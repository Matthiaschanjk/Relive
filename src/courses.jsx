import React, { useState, useEffect } from "react";
import { supabase } from './supabaseClient.js';
import { Link } from "react-router-dom";
import Review from "./reviews.jsx"
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from 'react-bootstrap/Button';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';


function Courses({school}) {
  const [selectedCard, setSelectedCard] = useState(0);
  const [courses, setCourses] = useState([]);
  const schoolUpper = school.toUpperCase()


async function retrieveCourses() {

  const {data, error} = await supabase
  .from('courses')
  .select()
  .eq('school', schoolUpper)
  .eq('status', "approved")

  if (error) {
    console.log(error)
  } else {
    console.log("Successfully retrieve Data")
  }

  setCourses(data);
}

  useEffect(() => {
    retrieveCourses();
  }, []);

    if (courses.length > 0) {
      return (
          <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
        gap: 2,
      }}
    >
      {courses.map((card, index) => (
        <Card key={index}>
          <CardActionArea
            onClick={() => setSelectedCard(index)}
            data-active={selectedCard === index ? '' : undefined}
            sx={{
              height: 200,
              backgroundColor: '#f5f5dc', // light beige background,
              border: '1px solid #d3c6a3',
              boxShadow: '3px 3px 5px rgba(0,0,0,0.2)',
              fontFamily: `'Georgia', serif`,
              '&[data-active]': {
                backgroundColor: 'action.selected',
                '&:hover': {
                  backgroundColor: 'action.selectedHover',
                },
              },
            }}
          >
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h5" component="div" className="font-weight-bold">
                {card.course}
              </Typography>
              <Typography variant="body2" color="text">
                {card.faculty}
              </Typography>
              <div className="d-flex justify-content-center align-self-center mt-5">
                <Link to={`${card.course.toLowerCase()}`}> <Button variant="outline-dark">Check Out Reviews!</Button></Link>
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  )} else {
    return (
    <div className="d-flex justify-content-center">
      <h2 className="mt-5">No courses yet, add one now!</h2>
    </div>
    )
  }
    }

export default Courses;