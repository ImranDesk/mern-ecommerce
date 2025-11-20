import React, { useState } from "react";
import { Form, Button, FormCheck, Container, Card, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { showToast } from "../components/Toast";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send OTP to email
      await api.post("/api/auth/send-otp", form);
      showToast("OTP sent to your email! Please check your inbox.", "success");
      // Navigate to OTP verification page with registration data
      navigate("/verify-otp", { state: { registrationData: form } });
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || "Error sending OTP. Please try again.";
      showToast(errorMsg, "danger");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-gradient text-white py-4">
              <h2 className="mb-0">Register</h2>
              <p className="mb-0 mt-2 opacity-75">Create a new account to get started</p>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Enter your name"
                  />
                </Form.Group>
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
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Enter your phone number (optional)"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Enter your address (optional)"
                  />
                </Form.Group>
                <FormCheck
                  type="switch"
                  label="Register as Admin"
                  className="mb-3"
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.checked ? "admin" : "user" })
                  }
                />
                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
