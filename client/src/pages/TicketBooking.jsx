// TicketBooking.jsx - Displays all available events for booking

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';

const TicketBooking = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `GEMS - ${t('titles.tickets')}`;
  }, [t]);

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
                  <Card className="h-100 shadow-sm">
                    {event.image && (
                      <Card.Img
                        variant="top"
                        src={event.image}
                        alt={event.event}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{event.event}</Card.Title>
                      <Card.Text>
                        {event.description
                          ? event.description.slice(0, 100) +
                            (event.description.length > 100 ? '...' : '')
                          : t('tickets.noDescription')}
                      </Card.Text>

                      <Card.Text>
                        <strong>{t('tickets.cardVenue')}</strong> {event.venue}
                      </Card.Text>

                      <Card.Text>
                        <strong>{t('tickets.date')}:</strong>{' '}
                        {new Date(event.date).toLocaleDateString()}
                      </Card.Text>

                      <Card.Text>
                        <strong>{t('tickets.capacity')}:</strong> {event.capacity}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
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
    </div>
  );
};

export default TicketBooking;
