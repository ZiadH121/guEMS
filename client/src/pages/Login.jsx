// Login.jsx
// Handles user login by collecting credentials and sending a POST request to the backend

import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const emailRegex = /\S+@\S+\.\S+/;

    if (!form.email || !form.password) {
      return setError(t('login.error1'));
    }
    if (!emailRegex.test(form.email)) {
      return setError(t('login.error2'));
    }

    try {
    const res = await apiFetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
        console.log('Login response:', res.status, data);
      if (!res.ok) return setError(data.error || t('login.error3'));

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess(t('login.success'));
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
       console.error('Login catch:', err);
      setError(t('login.error4'));
    }
  };

  useEffect(() => {
    document.title = `GEMS - ${t('titles.login')}`;
  }, [t]);

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }} className="p-4 shadow-sm">
        <Card.Body>
          <h2 className="text-center mb-4 text-brown">{t('login.title')}</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>{t('login.email')}</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('login.emailPlaceholder')}
              />
            </Form.Group>

          <Form.Group className="mb-4" controlId="password">
            <Form.Label>{t('login.password')}</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t('login.passwordPlaceholder')}
              />
              <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? t('login.hide') : t('login.show')}
              </Button>
            </InputGroup>
          </Form.Group>

            <Button type="submit" className="w-100 bg-brown border-0">
              {t('login.loginbutton')}
            </Button>
          </Form>

          <p className="text-center mt-3">
            {t('login.noAccount')}{' '}
            <span style={{ color: '#623E2A', cursor: 'pointer' }} onClick={() => navigate('/register')}>
              {t('login.register')}
            </span>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
