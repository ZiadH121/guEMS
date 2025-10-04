// CreateEvent.jsx (formerly VenueBooking.jsx)
// Allows staff/admins to create confirmed events directly

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';

const CreateEvent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    venue: '',
    date: '',
    capacity: '',
    price: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

    if (!form.name || !form.venue || !form.date) {
      setMessage({ type: 'danger', text: t('venueBook.error1') });
      setLoading(false);
      return;
    }

    try {
      const selectedVenue = venues.find((v) => v._id === form.venue);
      const body = {
        type: 'event',
        itemId: form.venue,
        details: {
          event: form.name,
          description: form.description,
          venue: selectedVenue?.name || 'Unknown',
          date: form.date,
          capacity: form.capacity || selectedVenue?.capacity || 0,
          price: form.price,
          image: form.image
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
        capacity: '',
        price: '',
        image: ''
      });
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || t('createEvent.error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <Container className="py-5" style={{ maxWidth: '600px' }}>
        <div className="d-flex justify-content-start mb-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t('createEvent.backButton')}
          </Button>
        </div>

        <h2 className="text-center text-brown mb-4">{t('createEvent.title')}</h2>

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
                  {v.name} ({v.date})
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
            <Form.Label>{t('createEvent.capacity')}</Form.Label>
            <Form.Control
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              placeholder="e.g. 100"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('createEvent.price')}</Form.Label>
            <Form.Control
              type="text"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 100 EGP"
            />
          </Form.Group>

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
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />{' '}
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
