import React from "react"
import { Outlet, Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

{/* Navigation Bar for Pages */}
function Header() {
    return (
      <>
      <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary" >
      <Container id="navigation">
        <Link to="/home" className="nav-link navigationHeader">Relive</Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto mt-1">
            <NavDropdown title={<span className="navigationText">Schools</span>} id="collapsible-nav-dropdown">
              <NavDropdown.Item href="nus">NUS</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="ntu">
                NTU
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="smu">SMU</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            {/* To make sure to change to Log out when users are registered */}
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