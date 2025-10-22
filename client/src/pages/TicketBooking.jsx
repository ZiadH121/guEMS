// TicketBooking.jsx - Displays all available events for booking

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';

const TicketBooking = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `GEMS - ${t('titles.tickets')}`;
  }, [t]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minute} ${ampm}`;
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiFetch('/events/public');
        const data = await res.json();
        if (!res.ok) throw new Error();

        const events = data.filter(
          (b) =>
            ['event'].includes(b.type) &&
            b.status === 'confirmed' &&
            b.details?.event &&
            b.details?.venue &&
            b.details?.date
        );

        const result = events.map((b) => ({
          _id: b._id,
          event: b.details.event,
          description: b.details.description,
          venue: b.details.venue,
          date: b.details.date,
          capacity: b.details.capacity,
          image: b.details.image || null,
          price: b.details.price || 0,
          slotType: b.details.slotType,
          slot: b.details.slot,
          startTime: b.details.startTime,
          endTime: b.details.endTime
        }));

        setEvents(result);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    fetchBookings();
  }, []);

  const handleBook = (eventDetails) => {
    navigate('/live-booking', { state: { event: eventDetails } });
  };

  return (
    <div className="fade-in">
      <Container className="py-5">
        <div className="d-flex justify-content-start mb-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t('tickets.backButton')}
          </Button>
        </div>

        <h2 className="text-center text-brown mb-4">{t('tickets.title')}</h2>

        {events.length === 0 ? (
          <p className="text-center text-muted">{t('tickets.noEvents')}</p>
        ) : (
          <Row className="g-4">
            {events
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((event, idx) => (
                <Col md={6} lg={4} key={idx}>
                  <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                    {event.image ? (
                      <Card.Img
                        variant="top"
                        src={event.image}
                        alt={event.event}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '200px',
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span className="text-muted">{t('tickets.noImage')}</span>
                      </div>
                    )}

                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="fw-bold">{event.event}</Card.Title>
                      <Card.Text className="flex-grow-1 text-muted" style={{ minHeight: '80px' }}>
                        {event.description && event.description.length > 100 ? (
                          <>
                            {event.description.slice(0, 100)}...
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 ms-1"
                              onClick={() => {
                                setSelectedDescription(event.description);
                                setShowModal(true);
                              }}
                            >
                              {t('tickets.readMore')}
                            </Button>
                          </>
                        ) : (
                          event.description || t('tickets.noDescription')
                        )}
                      </Card.Text>

                      <Card.Text className="mb-1">
                        <strong>{t('tickets.cardVenue')} </strong>
                        {event.venue}
                      </Card.Text>

                      <Card.Text className="mb-1">
                        <strong>{t('tickets.date')} </strong>
                        {new Date(event.date).toLocaleDateString()}
                      </Card.Text>

                      <Card.Text className="mb-1">
                        <strong>{t('tickets.time')} </strong>
                        {event.slotType === 'preset'
                          ? event.slot || '—'
                          : event.startTime && event.endTime
                          ? `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
                          : '—'}
                      </Card.Text>

                      <Card.Text className="mb-2">
                        <strong>{t('tickets.capacity')} </strong>
                        {event.capacity}
                      </Card.Text>

                      <Card.Text className="mb-3">
                        <strong>{t('tickets.price')} </strong>
                        {event.price ? `${event.price} EGP` : t('tickets.free')}
                      </Card.Text>
                    </Card.Body>

                    <Card.Footer className="bg-white border-0">
                      <Button
                        className="w-100 bg-brown border-0"
                        onClick={() => handleBook(event)}
                      >
                        {t('tickets.bookButton')}
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
          </Row>
        )}
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('tickets.fullDescription')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{selectedDescription}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t('tickets.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TicketBooking;
