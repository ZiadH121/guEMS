import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import { useTranslation, i18n } from 'react-i18next';

const CancelReasonModal = ({ show, onClose, bookingId, onSubmitted }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t, i18n } = useTranslation();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError(t('cancelReason.error1'));
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
          comment: reason,
          feedbackType: 'cancellation'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('cancelReason.error2'));

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSubmitted?.();
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="d-flex justify-content-between align-items-center" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <Modal.Title className="flex-grow-1 text-center">{t('cancelReason.title')}</Modal.Title>
    </Modal.Header>
      <Modal.Body className="bg-light rounded shadow-sm p-3">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{t('cancelReason.success')}</Alert>}
        <Form.Group>
          <Form.Label>{t('cancelReason.why')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>{t('cancelReason.closeButton')}</Button>
        <Button className="bg-brown" onClick={handleSubmit}>{t('cancelReason.submitButton')}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CancelReasonModal;
