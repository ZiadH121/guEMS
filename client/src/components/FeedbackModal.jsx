import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';

const FeedbackModal = ({ show, onClose, bookingId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t, i18n } = useTranslation();
  

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!rating) {
      setError(t('feedback.error1'));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch('/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId,
          rating,
          comment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('feedback.error2'));

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSubmitted?.();
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map(star => (
      <span
        key={star}
        onClick={() => setRating(star)}
        style={{
          fontSize: '24px',
          cursor: 'pointer',
          color: star <= rating ? '#ffc107' : '#ccc'
        }}
      >
        ★
      </span>
    ));
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="d-flex justify-content-between align-items-center" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <Modal.Title className="flex-grow-1 text-center">{t('feedback.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light rounded shadow-sm p-3">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{t('feedback.success')}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>{t('feedback.rating')}</Form.Label>
          <div>{renderStars()}</div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('feedback.comment')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {t('feedback.cancel')}
        </Button>
        <Button className="bg-brown" onClick={handleSubmit}>
          {t('feedback.submit')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FeedbackModal;
