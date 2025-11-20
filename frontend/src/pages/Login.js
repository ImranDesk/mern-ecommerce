import React, { useState } from "react";
import { Form, Button, Container, Card, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { showToast } from "../components/Toast";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      showToast("Login successful!", "success");
      navigate("/");
    } catch (err) {
      showToast("Invalid credentials", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-gradient text-white text-center py-4">
              <h2 className="mb-0">🔐 Login</h2>
              <p className="mb-0 mt-2 opacity-75">Welcome back! Please login to your account</p>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="Enter your email"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder="Enter your password"
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100 mb-3" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                <div className="text-center">
                  <Link to="/forgot-password" className="text-decoration-none">
                    Forgot Password?
                  </Link>
                </div>
                <div className="text-center mt-2">
                  <span className="text-muted">New? </span>
                  <Link to="/register" className="text-decoration-none">
                    Register
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
