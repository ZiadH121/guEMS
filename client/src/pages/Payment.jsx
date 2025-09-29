// Payment.jsx
// Accepts mock card input for booking confirmation and forwards the booking data to the confirmation page

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Modal, Spinner, InputGroup } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import useRouteGuard from '../hooks/useRouteGuard';
import { useTranslation } from 'react-i18next';

const Payment = () => {
  useRouteGuard(['items']);
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.items || [];
  const type = location.state?.type || 'event';
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    nameOnCard: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [showCVV, setShowCVV] = useState(false);
  const [cardBrand, setCardBrand] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const { t } = useTranslation();

    useEffect(() => {
    document.title = `GEMS - ${t('titles.payment')}`;
  }, [t]);

  const totalPrice = type === 'venue'
    ? booking.reduce((sum, b) => sum + Number(String(b.price).replace('$', '')), 0)
    : 100;

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const detectCardBrand = (num) => {
    if (num.startsWith('4')) return t('payment.visa');
    if (num.startsWith('5')) return t('payment.mastercard');
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'cardNumber') {
      newValue = formatCardNumber(value);
      setCardBrand(detectCardBrand(newValue.replace(/\s/g, '')));
    }

    if (name === 'expiry') {
      let cleaned = value.replace(/[^0-9]/g, '');
      if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
      if (cleaned.length >= 2) {
        newValue = cleaned.slice(0, 2) + (cleaned.length > 2 ? '/' + cleaned.slice(2) : '/');
      } else {
        newValue = cleaned;
      }
    }

    if (name === 'cvv' && /[^0-9]/.test(newValue)) return;

    setForm({ ...form, [name]: newValue });
    setError('');
  };

  const validateFields = () => {
    const { nameOnCard, cardNumber, expiry, cvv } = form;
    const cleanCard = cardNumber.replace(/\s/g, '');

    if (!nameOnCard || !cardNumber || !expiry || !cvv) return t('payment.error1');
    if (!/^[a-zA-Z]+ [a-zA-Z]+$/.test(nameOnCard.trim())) return t('payment.error2');
    if (!/^\d{16}$/.test(cleanCard)) return t('payment.error3');
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return t('payment.error4');
    if (!/^\d{3}$/.test(cvv)) return t('payment.error5');

    const [mm, yy] = expiry.split('/').map(Number);
    if (mm < 1 || mm > 12) return t('payment.error6');
    if (yy < 0 || yy > 99) return t('payment.error7');

    const expDate = new Date(2000 + yy, mm - 1, 1);
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (expDate < currentMonth) return t('payment.error8');
    if (cleanCard === '4000000000000002') return t('payment.error9');
    if (cvv === '000') return t('payment.error10');

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateFields();
    if (validationError) return setError(validationError);

    setSubmitting(true);
    setShowModal(true);

    try {
      const created = [];

      for (const item of booking) {
        const res = await apiFetch('/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            type,
            itemId: type === 'event'
              ? `${item.name}__${item.date}__${item.time}`
              : `${item.name}__${item.date}`,
              venueId: item.venueId,
              details: {
              name: item.name,
              date: item.date,
              time: item.time,
              seat: item.seat,
              event: item.event,
              price: item.price,
              venue: item.venue
            }
          })
        });

        const data = await res.json();
        if (res.status === 409) return setError(data.error || t('payment.error11'));
        if (!res.ok) throw new Error(data.error || t('payment.error12'));

        const confirmRes = await apiFetch(`/bookings/${data.booking._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'confirmed' })
        });

        if (!confirmRes.ok) throw new Error(t('payment.error13'));
        created.push(data.booking);
      }

      setTimeout(() => {
        navigate('/booking-confirmation', { state: { type, items: booking } });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setShowModal(false);
    }
  };

  const getValidationClass = (name, value) => {
    if (!value) return '';
    switch (name) {
      case 'nameOnCard':
        return /^[a-zA-Z]+ [a-zA-Z]+$/.test(value.trim()) ? 'is-valid' : 'is-invalid';
      case 'cardNumber':
        return /^\d{4} \d{4} \d{4} \d{4}$/.test(value) ? 'is-valid' : 'is-invalid';
      case 'expiry':
        return /^\d{2}\/\d{2}$/.test(value) ? 'is-valid' : 'is-invalid';
      case 'cvv':
        return /^\d{3}$/.test(value) ? 'is-valid' : 'is-invalid';
      default:
        return '';
    }
  };

  return (
    <div className="fade-in">
      <Container className="py-5" style={{ maxWidth: '600px' }}>
        <div className="d-flex justify-content-start mb-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>{t('payment.backButton')}</Button>
        </div>
        <Card className="p-4 shadow-sm">
          <h3 className="text-center text-brown mb-4">{t('payment.title')}</h3>

          <h6>{t('payment.title2')}</h6>
          <ul>
            {booking.map((item, idx) => (
              <li key={idx}>
                {type === 'event'
                  ? `Seat #${item.seat}`
                  : (
                    <>
                      <strong>{item.name}</strong><br />
                      {t('payment.date')} {item.date} <br />
                      {t('payment.time')} {item.time} <br />
                      {t('payment.price')} ${String(item.price || '').replace('$', '')}
                    </>
                  )}
              </li>
            ))}
          </ul>
          <p className="mt-2"><strong>{t('payment.total')}</strong> ${totalPrice}</p>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          <Form onSubmit={handleSubmit} className="mt-3">
            <Form.Group className="mb-3">
              <Form.Label>{t('payment.name')}</Form.Label>
              <Form.Control
                className={getValidationClass('nameOnCard', form.nameOnCard)}
                type="text"
                name="nameOnCard"
                value={form.nameOnCard}
                onChange={handleChange}
                placeholder={t('payment.namePlaceholder')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('payment.cardNumber')} {cardBrand && <small>({cardBrand})</small>}</Form.Label>
              <Form.Control
                className={getValidationClass('cardNumber', form.cardNumber)}
                type="text"
                name="cardNumber"
                value={form.cardNumber}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.name === 'cardNumber' && e.target.value.replace(/\s/g, '').length === 16) {
                    document.querySelector('input[name="expiry"]').focus();
                  }
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('payment.expiry')}</Form.Label>
              <Form.Control
                className={getValidationClass('expiry', form.expiry)}
                type="text"
                name="expiry"
                value={form.expiry}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.name === 'expiry' && e.target.value.length === 5) {
                    document.querySelector('input[name="cvv"]').focus();
                  }
                }}
                placeholder="MMYY"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>{t('payment.cvv')}</Form.Label>
              <InputGroup>
                <Form.Control
                  className={getValidationClass('cvv', form.cvv)}
                  type={showCVV ? "text" : "password"}
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength={3}
                />
                <Button variant="outline-secondary" onClick={() => setShowCVV(!showCVV)}>
                  {showCVV ? t('payment.hide') : t('payment.show')}
                  </Button>
              </InputGroup>
            </Form.Group>

            <Button type="submit" className="w-100 bg-brown border-0" disabled={submitting}>
              {submitting ? t('payment.processing') : t('payment.confirm')}
            </Button>
          </Form>
        </Card>
      </Container>

      <Modal show={showModal} centered backdrop="static">
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" className="mb-3" />
          <h5>{t('payment.processing2')}</h5>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Payment;
