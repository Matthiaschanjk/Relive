import React from "react"
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { Outlet, Link } from "react-router-dom";
import Header from "./header.jsx";
import Nuslogo from "./assets/nus.png";
import Ntulogo from "./assets/ntu.png";
import Smulogo from "./assets/smu.png";

{/* Home Page */}

function Home() {
    return (
        <>
        <Header />
        {/* Home Page Cards */}
        <Row xs={1} md={3} className="g-4 mt-5 mx-3">
          <Card border="warning" className="d-flex justify-content-center align-items-center">
            <Card.Img variant="top" src={Nuslogo} className="schoolLogo" />
            <Card.Body>
              <Card.Title>NUS</Card.Title>
              <Card.Text>
                The National University of Singapore is a national public research university in Singapore. 
                It was officially established in 1980 by the merging of the University of Singapore and Nanyang University.
              </Card.Text>
            <div className="d-flex justify-content-center align-items-center">
                <Link to="/nus"><Button variant="warning">View Reviews</Button></Link>
              </div>
            </Card.Body>
          </Card>
           <Card border="info" className="d-flex justify-content-center align-items-center">
            <Card.Img variant="top" src={Ntulogo} className="schoolLogo" />
            <Card.Body>
              <Card.Title>NTU</Card.Title>
              <Card.Text>
                Nanyang Technological University is a public research university in Singapore. 
                Founded in 1981, 
                it is also the second oldest autonomous university in the country
              </Card.Text>
              <div className="d-flex justify-content-center align-items-center">
                <Link to="/ntu"><Button variant="primary">View Reviews</Button></Link>
              </div>
            </Card.Body>
          </Card>
           <Card border="dark" className="d-flex justify-content-center align-items-center">
            <Card.Img variant="top" src={Smulogo} className="schoolLogo" />
            <Card.Body>
              <Card.Title>SMU</Card.Title>
              <Card.Text>
              Singapore Management University (SMU) is a publicly funded private university in Singapore. 
              Founded in 2000, SMU is the third oldest autonomous university in the country, 
              modelling its education after the Wharton School.
              </Card.Text>
            <div className="d-flex justify-content-center align-items-center">
                <Link to="/smu"><Button variant="dark">View Reviews</Button></Link>
              </div>
            </Card.Body>
          </Card>
    </Row>
        </>
    )
}


export default Home;