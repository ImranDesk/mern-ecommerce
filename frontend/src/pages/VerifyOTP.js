import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Container, Card, Row, Col, InputGroup } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { showToast } from "../components/Toast";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const registrationData = location.state?.registrationData;

  useEffect(() => {
    if (!registrationData) {
      showToast("Please complete registration first", "warning");
      navigate("/register");
      return;
    }

    // Countdown timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, registrationData, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      showToast("Please enter complete OTP", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/verify-otp-register", {
        email: registrationData.email,
        otp: otpString,
      });
      localStorage.setItem("token", res.data.token);
      showToast("Registration successful! Email verified.", "success");
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.msg || "Invalid OTP. Please try again.", "danger");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await api.post("/api/auth/send-otp", registrationData);
      showToast("OTP resent to your email", "success");
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      showToast(err.response?.data?.msg || "Error resending OTP", "danger");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Verify Your Email</h2>
              <p className="text-center text-muted mb-4">
                We've sent a 6-digit OTP to <strong>{registrationData?.email}</strong>
              </p>

              <Form onSubmit={handleVerify}>
                <div className="d-flex justify-content-center gap-2 mb-4">
                  {otp.map((digit, index) => (
                    <Form.Control
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="text-center"
                      style={{
                        width: "50px",
                        height: "60px",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                      required
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mb-3"
                  disabled={loading || otp.join("").length !== 6}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-muted">
                      Resend OTP in <strong>{timer}s</strong>
                    </p>
                  ) : (
                    <Button
                      variant="link"
                      onClick={handleResendOTP}
                      disabled={resendLoading}
                      className="p-0"
                    >
                      {resendLoading ? "Sending..." : "Resend OTP"}
                    </Button>
                  )}
                </div>

                <div className="text-center mt-3">
                  <Button
                    variant="link"
                    onClick={() => navigate("/register")}
                    className="text-decoration-none"
                  >
                    ← Back to Registration
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyOTP;

