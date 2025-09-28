// TicketBooking.jsx - Displays all available events for booking

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';

const TicketBooking = () => {
  const [groupedEvents, setGroupedEvents] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `GIP - ${t('titles.tickets')}`;
  }, [t]);  

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiFetch('/events/public');
        const data = await res.json();
        if (!res.ok) throw new Error();

        const venueBookings = data.filter(b =>
          b.type === 'venue' &&
          b.status === 'confirmed' &&
          b.details?.event &&
          b.details?.date &&
          b.details?.name
        );

        const grouped = {};
        for (const b of venueBookings) {
          const key = `${b.details.event}__${b.details.date}__${b.details.name}`;
          if (!grouped[key]) {
            grouped[key] = {
              ...b.details,
              times: [b.details.time],
              _id: b._id
            };
          } else {
            grouped[key].times.push(b.details.time);
          }
        }

        const result = Object.values(grouped).map(e => ({
          ...e,
          times: [...new Set(e.times)].sort()
        }));

        setGroupedEvents(result);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      const availabilityData = {};

      for (const event of groupedEvents) {
        const id = `${event.name}__${event.date}__${event.times.join(' - ')}`;
        try {
          const res = await apiFetch(`/availability/event/${encodeURIComponent(id)}`);
          const data = await res.json();

          if (res.ok && Array.isArray(data.seats)) {
            const booked = data.seats.filter(s => s.status === 'booked').length;
            const capacity = data.seats.length;
            availabilityData[event._id] = { booked, capacity };
          }
        } catch (err) {
          console.warn('Availability check failed for', event.event);
        }
      }

      setAvailabilityMap(availabilityData);
    };

    if (groupedEvents.length > 0) {
      fetchAvailability();
    }
  }, [groupedEvents]);

  const handleBook = (eventDetails) => {
    navigate('/live-booking', { state: { event: eventDetails } });
  };

  const formatTimeRange = (slots) => {
    if (!Array.isArray(slots) || slots.length === 0) return '';
    const first = slots[0].split(' - ')[0];
    const last = slots[slots.length - 1].split(' - ')[1];
    return `${first} - ${last}`;
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

        {groupedEvents.length === 0 ? (
          <p className="text-center text-muted">{t('tickets.noEvents')}</p>
        ) : (
          <Row className="g-4">
            {groupedEvents
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
                      <Card.Text><strong>{t('tickets.cardDate')}</strong> {event.date}</Card.Text>
                      <Card.Text><strong>{t('tickets.cardTime')}</strong> {formatTimeRange(event.times)}</Card.Text>
                      <Card.Text><strong>{t('tickets.cardVenue')}</strong> {event.name}</Card.Text>
                      <Card.Text>
                        <strong>{t('tickets.cardStatus')}</strong>{' '}
                        {availabilityMap[event._id] ? (
                          <span className={
                            availabilityMap[event._id].booked >= availabilityMap[event._id].capacity
                              ? 'text-danger'
                              : 'text-success'
                          }>
                            {availabilityMap[event._id].booked >= availabilityMap[event._id].capacity
                              ? t('tickets.cardStatusBooked')
                              : t('tickets.cardStatusAvailable')}
                          </span>
                        ) : (
                          <span className="text-muted">{t('tickets.loading')}</span>
                        )}
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
