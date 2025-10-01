// SubmitProposal.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../utils/api';

const SubmitProposal = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ title: '', description: '', capacity: '', venue: '', date: '' });
  const [venues, setVenues] = useState([]);
  const [message, setMessage] = useState('');

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

    try {
      const res = await apiFetch('/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(t('proposal.submitted'));
      setForm({ title: '', description: '', capacity: '', venue: '', date: '' });
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
        <Alert variant={message.includes('Error') ? 'danger' : message.includes('submitted') ? 'success' : 'warning'}>
          {message}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.title')}</Form.Label>
          <Form.Control name="title" value={form.title} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.description')}</Form.Label>
          <Form.Control as="textarea" name="description" value={form.description} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.capacity')}</Form.Label>
          <Form.Control type="number" name="capacity" value={form.capacity} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.venue')}</Form.Label>
          <Form.Select name="venue" value={form.venue} onChange={handleChange} required>
            <option value="">{t('proposal.selectVenue')}</option>
            {venues.map(v => (
              <option key={v._id} value={v._id}>{v.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>{t('proposal.date')}</Form.Label>
          <Form.Control type="date" name="date" value={form.date} onChange={handleChange} required />
        </Form.Group>
        <Button type="submit" className="btn bg-brown">{t('proposal.submitButton')}</Button>
      </Form>
    </Container>
  );
};

export default SubmitProposal;
