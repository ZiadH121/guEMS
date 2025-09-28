// VenueLiveBooking.jsx - Real-time time slot booking for venues
// Allows multiple time slot selection and grouped booking

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Container, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';
const user = JSON.parse(localStorage.getItem('user') || '{}');

const VenueLiveBooking = () => {
  const [slots, setSlots] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [mySlotTimes, setMySlotTimes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  const [eventName, setEventName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const selectedVenue = location.state?.slot;
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `GIP - ${t('titles.venueLiveBook')}`;
  }, [t]);

  useEffect(() => {
    if (!location.state?.slot) navigate('/venue-booking');
    if (user.role === 'visitor') navigate('/');

    const fetchAvailability = async () => {
      if (!selectedVenue?.name || !selectedVenue?.date) return;
      const token = localStorage.getItem('token');
      const itemId = encodeURIComponent(`${selectedVenue.name}__${selectedVenue.date}`);

      try {
        const [resAvail, resMyBookings] = await Promise.all([
          apiFetch(`/availability/venue/${itemId}`),
          apiFetch('/bookings', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const availability = await resAvail.json();
        const bookings = await resMyBookings.json();

        setSlots(availability.slots || []);

        const match = bookings.find(
          b => b.itemId === `${selectedVenue.name}__${selectedVenue.date}` && b.status === 'confirmed'
        );
        if (match) {
          if (Array.isArray(match.details.slots)) {
            setMySlotTimes(match.details.slots);
          } else if (typeof match.details.time === 'string') {
            const parts = match.details.time.split(' - ');
            setMySlotTimes([match.details.time, parts[0] && parts[1] ? `${parts[0]} - ${parts[1]}` : match.details.time]);
          }
        }
      } catch (err) {
        console.error('Fetch availability error:', err);
      }
    };

    fetchAvailability();
    const interval = setInterval(fetchAvailability, 4000);
    return () => clearInterval(interval);
  }, [selectedVenue]);

  const handleClick = (slot) => {
    if (slot.status !== 'available') return;
    setError('');
    setSuccess('');
    setNotifyMsg('');

    setSelectedIds(prev =>
      prev.includes(slot.id)
        ? prev.filter(id => id !== slot.id)
        : [...prev, slot.id]
    );
  };

  const handleProceed = () => {
    const selectedSlots = slots.filter(s => selectedIds.includes(s.id));

    if (!eventName.trim()) {
      return setError(t('venueBook.error1'));
    }
    if (!selectedSlots.length || !selectedVenue) {
      return setError(t('venueBook.error2'));
    }

    const items = selectedSlots.map(slot => ({
      ...selectedVenue,
      time: slot.time,
      event: eventName,
      slots: [slot.time],
      venueId: selectedVenue._id
    }));

    navigate('/payment', {
      state: {
        type: 'venue',
        items
      }
    });
  };

  const handleNotify = async (slot) => {
    const token = localStorage.getItem('token');
    setNotifyMsg('');

    try {
      const res = await apiFetch('/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'venue',
          itemId: `${selectedVenue.name}__${selectedVenue.date}`,
          details: {
            name: selectedVenue?.name,
            date: selectedVenue?.date,
            time: slot.time
          }
        })
      });

      const data = await res.json();
      if (!res.ok && res.status !== 409) throw new Error(data.error || t('venueBook.error3'));

      setNotifyMsg(data.message || t('venueBook.erro4'));
    } catch (err) {
      setNotifyMsg(err.message);
    }
  };

  const getColor = (status, isSelected, time) => {
    const normalizedTime = (time || '').trim();
    const isMine = mySlotTimes.some(t => t.trim() === normalizedTime);

    if (status === 'booked') return '#dc3545';
    if (status === 'pending') return '#0dcaf0';
    if (isMine) return '#198754';
    if (isSelected) return '#0d6efd';
    return '#adb5bd';
  };

  return (
    <div className="fade-in">
      <Container className="py-5 text-center">
        <div className="d-flex justify-content-start mb-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            {t('venueBook.backButton')}
          </Button>
        </div>
        <h2 className="text-brown mb-3">{t('venueBook.title')}</h2>
        {selectedVenue && (
          <div className="mb-4">
            <h5>{selectedVenue.name}</h5>
            <p><strong>{t('venueBook.detailsDate')}</strong> {selectedVenue.date}</p>
            <p><strong>{t('venueBook.detailsCapacity')}</strong> {selectedVenue.capacity}</p>
            <p><strong>{t('venueBook.detailsAvailability')}</strong> {selectedVenue.availability}</p>
            <p><strong>{t('venueBook.detailsPrice')}</strong> {selectedVenue.price}</p>
          </div>
        )}

        <Form.Group className="mb-3" controlId="eventNameInput">
          <Form.Label>{t('venueBook.eventName')}</Form.Label>
          <Form.Control
            type="text"
            placeholder={t('venueBook.eventNamePlaceholder')}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </Form.Group>

        <Row className="g-4 justify-content-center">
          {slots.map(slot => {
            const isSelected = selectedIds.includes(slot.id);
            return (
              <Col sm={6} md={4} key={slot.id}>
                <Card
                  style={{
                    backgroundColor: getColor(slot.status, isSelected, slot.time),
                    color: '#fff',
                    cursor: slot.status === 'available' ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => handleClick(slot)}
                >
                  <Card.Body>
                    <Card.Title>{slot.time}</Card.Title>
                    <Card.Text>{slot.status}</Card.Text>
                    {slot.status !== 'available' && (
                      <Button
                        variant="light"
                        size="sm"
                        className="mt-2"
                        onClick={e => {
                          e.stopPropagation();
                          handleNotify(slot);
                        }}
                      >
                        {t('venueBook.notifyButton')}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        <div className="text-center mt-4">
          <span className="me-3">
            <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#198754', marginRight: 5 }} /> {t('venueBook.legendYourBooking')}
          </span>
          <span className="me-3">
            <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#0d6efd', marginRight: 5 }} /> {t('venueBook.legendSelected')}
          </span>
          <span className="me-3">
            <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#adb5bd', marginRight: 5 }} /> {t('venueBook.legendAvailable')}
          </span>
          <span className="me-3">
            <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#dc3545', marginRight: 5 }} /> {t('venueBook.legendBooked')}
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#0dcaf0', marginRight: 5 }} /> {t('venueBook.legendPending')}
          </span>
        </div>

        {error && <Alert variant="danger" className="mt-4">{error}</Alert>}
        {success && <Alert variant="success" className="mt-4">{success}</Alert>}
        {notifyMsg && <Alert variant="info" className="mt-4">{notifyMsg}</Alert>}

        {selectedIds.length > 0 && (
          <div className="mt-4">
            <p><strong>{t('venueBook.selectedSlot')}</strong> {slots.filter(s => selectedIds.includes(s.id)).map(s => s.time).join(', ')}</p>
            <Button className="bg-brown border-0" onClick={handleProceed}>
              {t('venueBook.proceedPayment')}
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default VenueLiveBooking;
