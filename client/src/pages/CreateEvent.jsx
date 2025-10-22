// CreateEvent.jsx
// Allows staff/admins to create confirmed events directly with hybrid time-slot selection

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';

const CreateEvent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `GEMS - ${t('titles.createEvent')}`;
  }, [t]);

  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    venue: '',
    date: '',
    slotType: 'preset',
    slot: '',
    startTime: '',
    endTime: '',
    capacity: '',
    price: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const presetSlots = [
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
    '8:00 PM - 10:00 PM'
  ];

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await apiFetch('/venues');
        const data = await res.json();
        if (!res.ok) throw new Error();
        setVenues(data);
      } catch {
        setMessage({ type: 'danger', text: t('venueMgmt.error1') });
      }
    };
    fetchVenues();
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (
      !form.name ||
      !form.description ||
      !form.venue ||
      !form.date ||
      !form.capacity ||
      !form.price
    ) {
      setMessage({ type: 'danger', text: t('createEvent.error') });
      setLoading(false);
      return;
    }

    if (form.slotType === 'custom') {
      if (!form.startTime || !form.endTime) {
        setMessage({ type: 'danger', text: t('createEvent.missingCustomTime') });
        setLoading(false);
        return;
      }
      if (form.startTime >= form.endTime) {
        setMessage({ type: 'danger', text: t('createEvent.invalidTimeOrder') });
        setLoading(false);
        return;
      }
      if (form.startTime < '10:00' || form.endTime > '22:00') {
        setMessage({ type: 'danger', text: t('createEvent.outOfHours') });
        setLoading(false);
        return;
      }
    } else if (form.slotType === 'preset' && !form.slot) {
      setMessage({ type: 'danger', text: t('createEvent.missingSlot') });
      setLoading(false);
      return;
    }

    try {
      const selectedVenue = venues.find((v) => v._id === form.venue);
      const body = {
        type: 'event',
        itemId: `${selectedVenue?.name || 'Unknown Venue'}_${Date.now()}`,
        details: {
          event: form.name,
          description: form.description,
          venue: selectedVenue?.name || 'Unknown',
          date: form.date,
          slotType: form.slotType,
          slot: form.slot,
          startTime: form.startTime,
          endTime: form.endTime,
          capacity: Number(form.capacity),
          price: Number(form.price),
          image: form.image
        },
        creator: {
          id: JSON.parse(localStorage.getItem('user') || '{}')._id,
          name: JSON.parse(localStorage.getItem('user') || '{}').name,
          email: JSON.parse(localStorage.getItem('user') || '{}').email
        },
        status: 'confirmed'
      };

      const res = await apiFetch('/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('createEvent.error'));

      setMessage({ type: 'success', text: t('createEvent.success') });
      setForm({
        name: '',
        description: '',
        venue: '',
        date: '',
        slotType: 'preset',
        slot: '',
        startTime: '',
        endTime: '',
        capacity: '',
        price: '',
        image: ''
      });
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.message || t('createEvent.error')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <Container className="py-5" style={{ maxWidth: '650px' }}>
        <div className="d-flex justify-content-start mb-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t('createEvent.backButton')}
          </Button>
        </div>

        <h2 className="text-center text-brown mb-4">
          {t('createEvent.title')}
        </h2>

        {message.text && (
          <Alert variant={message.type} className="text-center">
            {message.text}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>{t('createEvent.name')}</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('createEvent.desc')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('createEvent.venue')}</Form.Label>
            <Form.Select
              name="venue"
              value={form.venue}
              onChange={handleChange}
              required
            >
              <option value="">{t('createEvent.venue')}</option>
              {venues.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('createEvent.date')}</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('createEvent.slotTypeLabel')}</Form.Label>
            <Form.Select
              name="slotType"
              value={form.slotType}
              onChange={handleChange}
            >
              <option value="preset">{t('createEvent.presetSlot')}</option>
              <option value="custom">{t('createEvent.customSlot')}</option>
            </Form.Select>
          </Form.Group>

          {form.slotType === 'preset' && (
            <Form.Group className="mb-3">
              <Form.Label>{t('createEvent.slotLabel')}</Form.Label>
              <Form.Select
                name="slot"
                value={form.slot}
                onChange={handleChange}
              >
                <option value="">{t('createEvent.selectSlot')}</option>
                {presetSlots.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {form.slotType === 'custom' && (
            <Row className="mb-3">
              <Col>
                <Form.Label>{t('createEvent.startTime')}</Form.Label>
                <Form.Control
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                />
              </Col>
              <Col>
                <Form.Label>{t('createEvent.endTime')}</Form.Label>
                <Form.Control
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                />
              </Col>
            </Row>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('createEvent.capacity')}</Form.Label>
                <Form.Control
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 100"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('createEvent.price')}</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 100"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label>{t('createEvent.image')}</Form.Label>
            <Form.Control
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </Form.Group>

          <div className="text-center">
            <Button
              type="submit"
              className="bg-brown border-0"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />{' '}
                  {t('createEvent.submitButton')}
                </>
              ) : (
                t('createEvent.submitButton')
              )}
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default CreateEvent;
