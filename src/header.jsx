import React from "react"
import { Outlet, Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { LinkContainer } from 'react-router-bootstrap';

function Header() {
    return (
      <>
      <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary" >
      <Container id="navigation">
        <Link to="/" className="nav-link navigationHeader">Relive</Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link className="navigationText" href="#features">Home</Nav.Link>
            <NavDropdown  title={<span className="navigationText">Schools</span>} id="collapsible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">NUS</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                NTU
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">SMU</NavDropdown.Item>
              <NavDropdown.Divider />
            </NavDropdown>
          </Nav>
          <Nav>
            <Link to="/login" className="nav-link navigationText">Login</Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
      <Outlet />
      </>
    )
}

export default Header;