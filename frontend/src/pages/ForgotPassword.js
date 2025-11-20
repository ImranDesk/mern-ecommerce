import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/forgot-password', { email });
      alert('Reset email sent');
    } catch (err) {
      alert('Error');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </Form.Group>
      <Button type="submit">Send Reset Link</Button>
    </Form>
  );
};

export default ForgotPassword;