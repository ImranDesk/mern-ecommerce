import React, { useEffect } from "react";
import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCart, selectCartItemCount, clearCart } from "../store/slices/cartSlice";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("token");
  const role = token ? jwtDecode(token).role : null;
  const cartCount = useAppSelector(selectCartItemCount);

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
    } else {
      dispatch(clearCart());
    }
  }, [token, dispatch]);

  const logout = () => {
    localStorage.removeItem("token");
    dispatch(clearCart());
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid="lg">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <span className="me-2">🛍️</span>
          <span>Ecommerce</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto align-items-center">
            <Nav.Link as={Link} to="/" className="px-3">
              Home
            </Nav.Link>
            {token && (
              <>
                <Nav.Link as={Link} to="/cart" className="position-relative px-3">
                  Cart
                  {cartCount > 0 && (
                    <Badge 
                      bg="danger" 
                      pill 
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.7rem', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Nav.Link>
                <Nav.Link as={Link} to="/orders" className="px-3">
                  Orders
                </Nav.Link>
                <Nav.Link as={Link} to="/profile" className="px-3">
                  Profile
                </Nav.Link>
              </>
            )}
            {role === "admin" && (
              <Nav.Link as={Link} to="/admin" className="px-3">
                Admin Dashboard
              </Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-center">
            {token ? (
              <Nav.Link onClick={logout} className="px-3" style={{ cursor: 'pointer' }}>
                Logout
              </Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="px-3">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="px-3">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
