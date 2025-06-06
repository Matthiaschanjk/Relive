import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from 'react-bootstrap/Button';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

const cards = [
  {
    id: 1,
    title: 'Computer Science',
    description: 'Bachelor of Computing in Computer Science (with Honours)',
    school: 'NUS'
  },
  {
    id: 2,
    title: 'Medicine',
    description: 'NUS Yong Loo Lin School Of Medicine',
  },
  {
    id: 3,
    title: 'Business Administration',
    description: 'Bachelor of Business Administration',
  },
    {
    id: 1,
    title: 'Computer Science',
    description: 'Bachelor of Computing in Computer Science (with Honours)',
  },
  {
    id: 2,
    title: 'Medicine',
    description: 'NUS Yong Loo Lin School Of Medicine',
  },
  {
    id: 3,
    title: 'Business Administration',
    description: 'Bachelor of Business Administration',
  },
    {
    id: 1,
    title: 'Computer Science',
    description: 'Bachelor of Computing in Computer Science (with Honours)',
  },
  {
    id: 2,
    title: 'Medicine',
    description: 'NUS Yong Loo Lin School Of Medicine',
  },
  {
    id: 3,
    title: 'Business Administration',
    description: 'Bachelor of Business Administration',
  },
    {
    id: 1,
    title: 'Computer Science',
    description: 'Bachelor of Computing in Computer Science (with Honours)',
  },
  {
    id: 2,
    title: 'Medicine',
    description: 'NUS Yong Loo Lin School Of Medicine',
  },
  {
    id: 3,
    title: 'Business Administration',
    description: 'Bachelor of Business Administration',
  },
    {
    id: 1,
    title: 'Computer Science',
    description: 'Bachelor of Computing in Computer Science (with Honours)',
  },
  {
    id: 2,
    title: 'Medicine',
    description: 'NUS Yong Loo Lin School Of Medicine',
  },
  {
    id: 3,
    title: 'Business Administration',
    description: 'Bachelor of Business Administration',
  },
    {
    id: 1,
    title: 'Computer Science',
    description: 'Bachelor of Computing in Computer Science (with Honours)',
  },
  {
    id: 2,
    title: 'Medicine',
    description: 'NUS Yong Loo Lin School Of Medicine',
  },
  {
    id: 3,
    title: 'Business Administration',
    description: 'Bachelor of Business Administration',
  },
];

function Courses() {
  const [selectedCard, setSelectedCard] = React.useState(0);
  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
        gap: 2,
      }}
    >
      {cards.map((card, index) => (
        <Card>
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
                {card.title}
              </Typography>
              <Typography variant="body2" color="text">
                {card.description}
              </Typography>
              <div className="d-flex justify-content-center align-self-center mt-5">
                  <Button variant="outline-dark">Check Out Reviews!</Button>
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}

export default Courses;