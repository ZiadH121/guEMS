// SubmitProposal.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../utils/api';

const SubmitProposal = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: '',
    description: '',
    capacity: '',
    venue: '',
    date: '',
    slotType: 'preset',
    slot: '',
    startTime: '',
    endTime: '',
    sldNeeds: '',
    price: '',
    image: ''
  });
  const [venues, setVenues] = useState([]);
  const [message, setMessage] = useState('');
  const presetSlots = [
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
    '8:00 PM - 10:00 PM'
  ];

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    if (form.capacity <= 0) {
      setMessage(t('proposal.invalidCapacity'));
      return;
    }
    if (new Date(form.date) < new Date()) {
      setMessage(t('proposal.invalidDate'));
      return;
    }

    if (!form.price || isNaN(form.price) || form.price < 0) {
      setMessage(t('proposal.invalidPrice'));
      return;
    }

    if (form.slotType === 'custom') {
      if (!form.startTime || !form.endTime) {
        setMessage(t('proposal.missingCustomTime'));
        return;
      }
      if (form.startTime >= form.endTime) {
        setMessage(t('proposal.invalidTimeOrder'));
        return;
      }
      if (form.startTime < '10:00' || form.endTime > '22:00') {
        setMessage(t('proposal.outOfHours'));
        return;
      }
    } else if (form.slotType === 'preset' && !form.slot) {
      setMessage(t('proposal.missingSlot'));
      return;
    }

    try {
      const res = await apiFetch('/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(t('proposal.submitted'));
      setForm({
        title: '',
        description: '',
        capacity: '',
        venue: '',
        date: '',
        slotType: 'preset',
        slot: '',
        startTime: '',
        endTime: '',
        sldNeeds: '',
        price: '',
        image: ''
      });
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await apiFetch('/venues', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) setVenues(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVenues();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="mb-4">{t('proposal.submitTitle')}</h2>

      {message && (
        <Alert
          variant={
            message.includes('Error')
              ? 'danger'
              : message.includes('submitted')
              ? 'success'
              : 'warning'
          }
        >
          {message}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.title')}</Form.Label>
          <Form.Control
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.description')}</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>{t('proposal.capacity')}</Form.Label>
              <Form.Control
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>{t('proposal.price')}</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.imageUrl')}</Form.Label>
          <Form.Control
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder={t('proposal.imagePlaceholder')}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.venue')}</Form.Label>
          <Form.Select
            name="venue"
            value={form.venue}
            onChange={handleChange}
            required
          >
            <option value="">{t('proposal.selectVenue')}</option>
            {venues.map(v => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.date')}</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.slotTypeLabel')}</Form.Label>
          <Form.Select
            name="slotType"
            value={form.slotType}
            onChange={handleChange}
          >
            <option value="preset">{t('proposal.presetSlot')}</option>
            <option value="custom">{t('proposal.customSlot')}</option>
          </Form.Select>
        </Form.Group>

        {form.slotType === 'preset' && (
          <Form.Group className="mb-3">
            <Form.Label>{t('proposal.slotLabel')}</Form.Label>
            <Form.Select
              name="slot"
              value={form.slot}
              onChange={handleChange}
            >
              <option value="">{t('proposal.selectSlot')}</option>
              {presetSlots.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </Form.Select>
          </Form.Group>
        )}

        {form.slotType === 'custom' && (
          <Row className="mb-3">
            <Col>
              <Form.Label>{t('proposal.startTime')}</Form.Label>
              <Form.Control
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
              />
            </Col>
            <Col>
              <Form.Label>{t('proposal.endTime')}</Form.Label>
              <Form.Control
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
              />
            </Col>
          </Row>
        )}

        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.sldNeedsLabel')}</Form.Label>
          <Form.Control
            as="textarea"
            name="sldNeeds"
            value={form.sldNeeds}
            onChange={handleChange}
            placeholder={t('proposal.sldNeedsPlaceholder')}
            rows={3}
          />
        </Form.Group>

        <Button type="submit" className="btn bg-brown">
          {t('proposal.submitButton')}
        </Button>
      </Form>
    </Container>
  );
};

export default SubmitProposal;
