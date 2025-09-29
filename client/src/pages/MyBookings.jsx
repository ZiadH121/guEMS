// MyBookings.jsx - Displays current and past bookings for the user
// Filter bookings by status or sort by date
// Send DELETE request to cancel a booking

import React, { useEffect, useState } from 'react';
import {
  Container, Card, Row, Col, Alert, Button, Form, Tabs, Tab, Badge
} from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import FeedbackModal from '../components/FeedbackModal';
import CancelReasonModal from '../components/CancelReasonModal';
import { useTranslation } from 'react-i18next';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [activeTab, setActiveTab] = useState('event');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackBookingId, setFeedbackBookingId] = useState(null);
  const navigate = useNavigate();
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    document.title = `GEMS - ${t('titles.myBookings')}`;
  }, [t]);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await apiFetch('/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('myBooks.error1'));

      setBookings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async id => {
  const token = localStorage.getItem('token');
  const confirm = window.confirm(t('myBooks.cancelConfirm'));
  if (!confirm) return;

  try {
    const res = await apiFetch(`/bookings/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('myBooks.error2'));

    setSuccess(t('myBooks.cancelSuccess'));
    setCancelBookingId(id);
    setShowCancelReason(true);
    fetchBookings();
  } catch (err) {
    setError(err.message);
  }
};

  const handleOpenFeedback = (bookingId) => {
    setFeedbackBookingId(bookingId);
    setShowFeedback(true);
  };

  const renderCard = (booking, index) => {
    return (
      <Col md={6} lg={4} key={index}>
        <Card className="h-100 shadow-sm">
          <Card.Body>
            <Card.Title className="text-capitalize d-flex justify-content-between align-items-center">
              {booking.type === 'event' ? t('myBooks.cardTitleEvent') : t('myBooks.cardTitleVenue')}
            </Card.Title>
            <Card.Text><strong>{t('myBooks.cardStatus')}</strong> {t(`myBooks.status.${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`)}</Card.Text>
            <Card.Text><strong>{t('myBooks.cardBookedOn')}</strong> {new Date(booking.createdAt).toLocaleString()}</Card.Text>

            {booking.type === 'event' && booking.details && (
              <>
                <Card.Text><strong>{t('myBooks.eventCardEvent')}</strong> {booking.details.title}</Card.Text>
                <Card.Text><strong>{t('myBooks.eventCardSeats')}</strong> {booking.details.seats?.join(', ') || booking.details.seat}</Card.Text>
                <Card.Text><strong>{t('myBooks.eventCardDate')}</strong> {booking.details.date}</Card.Text>
                <Card.Text><strong>{t('myBooks.eventCardTime')}</strong> {booking.details.time}</Card.Text>
                <Card.Text><strong>{t('myBooks.eventCardVenue')}</strong> {booking.details.venue}</Card.Text>
              </>
            )}

            {booking.type === 'venue' && booking.details && (
              <>
                <Card.Text><strong>{t('myBooks.venueCardVenue')}</strong> {booking.details.name}</Card.Text>
                <Card.Text><strong>{t('myBooks.venueCardDate')}</strong> {booking.details.date}</Card.Text>
                <Card.Text><strong>{t('myBooks.venueCardTime')}</strong> {booking.details.time}</Card.Text>
              </>
            )}

            <div className="d-flex gap-2 mt-3 flex-wrap">
              {booking.status !== 'cancelled' && booking._id && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleCancel(booking._id)}
                >
                  {t('myBooks.cancelButton')}
                </Button>
              )}
              {booking.status === 'confirmed' && (
                <Button
                  className="bg-brown"
                  size="sm"
                  onClick={() => handleOpenFeedback(booking._id)}
                >
                  {t('myBooks.feedbackButton')}
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  const getFilteredBookings = (type) => {
    return bookings
      .filter(b =>
        b.type === type &&
        (filter === 'all' || b.status === filter)
      )
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortNewestFirst ? timeB - timeA : timeA - timeB;
      });
  };

  return (
    <Container className="py-5">
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
        className="mb-3"
      >
        {t('myBooks.backButton')}
      </Button>
      <h2 className="text-center text-brown mb-4">{t('myBooks.title')}</h2>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {success && <Alert variant="success" className="text-center">{success}</Alert>}
      {!error && bookings.length === 0 && <p className="text-center">{t('myBooks.noBookings')}</p>}

      <Row className="mb-4">
        <Col md={6}>
          <Form.Select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">{t('myBooks.typeFilterTitle')}</option>
            <option value="confirmed">{t('myBooks.typeFilterConfirmed')}</option>
            <option value="pending">{t('myBooks.typeFilterPending')}</option>
            <option value="cancelled">{t('myBooks.typeFilterCancelled')}</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <Button
            className="bg-brown border-0 w-100"
            onClick={() => setSortNewestFirst(!sortNewestFirst)}
          >
            {t('myBooks.dateFilterTitle')} {sortNewestFirst ? t('myBooks.dateFilterNew') : t('myBooks.dateFilterOld')}
          </Button>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key)}
        className="mb-3 justify-content-center custom-tabs"
        fill
      >
        <Tab eventKey="event" title={t('myBooks.eventTab')}>
          <Row className="g-4">
            {getFilteredBookings('event').map(renderCard)}
          </Row>
        </Tab>
        <Tab eventKey="venue" title={t('myBooks.venueTab')}>
          <Row className="g-4">
            {getFilteredBookings('venue').map(renderCard)}
          </Row>
        </Tab>
      </Tabs>

      <FeedbackModal
        show={showFeedback}
        onClose={() => setShowFeedback(false)}
        bookingId={feedbackBookingId}
        onSubmitted={fetchBookings}
      />
      <CancelReasonModal
        show={showCancelReason}
        onClose={() => setShowCancelReason(false)}
        bookingId={cancelBookingId}
        onSubmitted={fetchBookings}
      />

    </Container>
  );
};

export default MyBookings;
