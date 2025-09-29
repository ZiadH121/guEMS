// Register.jsx - Handles user registration form and validation
// Includes optional checkbox for requesting organizer role

import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Alert, ProgressBar, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    wantsToBeOrganizer: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `GEMS - ${t('titles.register')}`;
  }, [t]);  

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const checkStrength = password => {
    if (password.length < 6) return { label: t('register.weak'), variant: 'danger', now: 33 };
    if (password.length < 10) return { label: t('register.medium'), variant: 'warning', now: 66 };
    return { label: t('register.strong'), variant: 'success', now: 100 };
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const emailRegex = /\S+@\S+\.\S+/;

    if (!form.name || !form.email || !form.password || !form.confirm) {
      return setError(t('register.error1'));
    }
    if (!emailRegex.test(form.email)) {
      return setError(t('register.error2'));
    }
    if (form.password.length < 6) {
      return setError(t('register.error3'));
    }
    if (form.password !== form.confirm) {
      return setError(t('register.error4'));
    }

    try {
      const res = await apiFetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          wantsToBeOrganizer: form.wantsToBeOrganizer
        })
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || t('register.error5'));

      setSuccess(t('register.success'));
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(t('register.error6'));
    }
  };

  const strength = checkStrength(form.password);
  const showStrength = form.password.length > 0;
  const showLiveMismatch = form.confirm.length > 0 && form.confirm !== form.password;

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '100%', maxWidth: '450px' }} className="p-4 shadow-sm">
        <Card.Body>
          <h2 className="text-center mb-4 text-brown">{t('register.title')}</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>{t('register.name')}</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder= {t('register.namePlaceholder')}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>{t('register.email')}</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('register.emailPlaceholder')}
              />
            </Form.Group>

          <Form.Group className="mb-2" controlId="password">
            <Form.Label>{t('register.password')}</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t('register.passwordPlaceholder')}
              />
              <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? t('register.hide') : t('register.show')}
              </Button>
            </InputGroup>
          </Form.Group>

            {showStrength && (
              <ProgressBar
                striped
                animated
                now={strength.now}
                variant={strength.variant}
                label={strength.label}
                className="mb-3"
              />
            )}

            <Form.Group className="mb-2" controlId="confirm">
              <Form.Label>{t('register.passwordConfirm')}</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder={t('register.passwordConfirmPlaceholder')}
                  isInvalid={showLiveMismatch}
                />
                <Button variant="outline-secondary" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? t('register.hide2') : t('register.show2')}
                </Button>
              </InputGroup>
              {showLiveMismatch && (
                <Form.Text className="text-danger">
                  {t('register.passwordMismatched')}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="wantsToBeOrganizer">
              <Form.Check
                type="checkbox"
                label={t('register.organizerReq')}
                name="wantsToBeOrganizer"
                checked={form.wantsToBeOrganizer}
                onChange={e =>
                  setForm({ ...form, wantsToBeOrganizer: e.target.checked })
                }
              />
            </Form.Group>

            <Button type="submit" className="w-100 bg-brown border-0 mt-2">
              {t('register.registerButton')}
            </Button>
          </Form>

          <p className="text-center mt-3">
            {t('register.alreadyAccount')}{' '}
            <span
              style={{ color: '#0D234B', cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            >
              {t('register.login')}
            </span>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
