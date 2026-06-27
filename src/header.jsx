import { Outlet, Link, useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useAuth } from './AuthContext.jsx';

function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { state: { loggedOut: true } });
  };

  return (
    <>
      <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
        <Container id="navigation">
          <Link to="/home" className="nav-link navigationHeader">Relive</Link>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto mt-1">
              <NavDropdown title={<span className="navigationText">Schools</span>} id="collapsible-nav-dropdown">
                <NavDropdown.Item as={Link} to="/nus">NUS</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/ntu">NTU</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/smu">SMU</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav>
              {user?.isAdmin && (
                <Link to="/admin" className="nav-link navigationText">Admin</Link>
              )}
              {user
                ? <Link onClick={handleLogout} className="nav-link navigationText">Log Out</Link>
                : <Link to="/login" className="nav-link navigationText">Login</Link>
              }
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
    </>
  );
}

export default Header;
