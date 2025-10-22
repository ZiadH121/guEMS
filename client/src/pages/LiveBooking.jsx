// LiveBooking.jsx – Seat selection and booking for an event

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';

const user = JSON.parse(localStorage.getItem('user') || '{}');

const LiveBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [mySeat, setMySeat] = useState('');
  const [error, setError] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  const { t } = useTranslation();

  const formatSlotRange = (timeValue) => {
    const slots = Array.isArray(timeValue)
      ? timeValue
      : typeof timeValue === 'string'
      ? timeValue.split(' - ')
      : [];

    if (slots.length <= 1) return timeValue;
    const start = slots[0]?.split(' - ')[0]?.trim() || slots[0];
    const end = slots[slots.length - 1]?.split(' - ')[1]?.trim() || slots[slots.length - 1];
    return `${start} - ${end}`;
  };

  useEffect(() => {
    if (!event) navigate('/ticket-booking');

    const fetchSeats = async () => {
      const id = encodeURIComponent(`${event.name}__${event.date}__${event.time}`);
      const token = localStorage.getItem('token');

      try {
        const [resAvail, resMyBookings] = await Promise.all([
          apiFetch(`/availability/event/${event._id}`),
          apiFetch('/bookings', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const available = await resAvail.json();
        const bookings = await resMyBookings.json();

        setSeats(available.seats || []);

        const found = bookings.find(
          b => b.itemId === event._id && b.status === 'confirmed'
        );
        if (found) setMySeat(found.details.seat);
      } catch (err) {
        console.error('Seat fetch error:', err);
      }
    };

    fetchSeats();
    const interval = setInterval(fetchSeats, 4000);
    return () => clearInterval(interval);
  }, [event]);

  useEffect(() => {
    document.title = `GEMS - ${t('titles.liveBook')}`;
  }, [t]);
  
  const handleClick = (seat) => {
    if (seat.status !== 'available') return;
    setError('');
    setNotifyMsg('');
    setSelectedSeat(seat.id);
  };

  const handleProceedToPayment = () => {
    if (!selectedSeat) return setError(t('liveBook.error1'));

    navigate('/payment', {
      state: {
        type: 'event',
        items: [{
          ...event,
          seat: selectedSeat
        }]
      }
    });
  };

  const handleNotify = async (seat) => {
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
          type: 'event',
          itemId: event._id,
          details: {
            name: event.name || event.event,
            date: event.date,
            slotType: event.slotType,
            slot: event.slot,
            startTime: event.startTime,
            endTime: event.endTime,
            seat: seat.id
          }
        })
      });

      const data = await res.json();
      if (!res.ok && res.status !== 409) throw new Error(data.error || t('liveBook.error2'));
      setNotifyMsg(data.message || t('liveBook.error3'));
    } catch (err) {
      setNotifyMsg(err.message);
    }
  };

      const getColor = (status, isSelected, id) => {
        if (status === 'booked') return '#dc3545';
        if (status === 'pending') return '#0dcaf0';
        if (mySeat === id) return '#198754';
        if (isSelected) return '#0d6efd';
        return '#adb5bd';
      };

  return (
    <div className="fade-in">
      <Container className="py-5 text-center">
      <div className="d-flex justify-content-start mb-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>{t('liveBook.backButton')}</Button>
      </div>
        <h2 className="text-brown mb-4">{t('liveBook.title')}</h2>
          <Card className="shadow-sm border-0 rounded-4 mx-auto mb-4" style={{ maxWidth: '500px' }}>
            <Card.Body className="text-start">
              <h4 className="text-brown fw-bold mb-3">{event?.name || event?.event}</h4>
              <p className="mb-1"><strong>{t('liveBook.date')}</strong> {new Date(event?.date).toLocaleDateString()}</p>
              <p className="mb-1"><strong>{t('liveBook.time')}</strong> {formatSlotRange(event?.time || event?.slot || `${event?.startTime} - ${event?.endTime}`)}</p>
              <p className="mb-1"><strong>{t('liveBook.venue')}</strong> {event?.venue || event?.name}</p>
              <p className="mb-1"><strong>{t('liveBook.price')}</strong> {event?.price ? `${event.price} EGP` : t('tickets.free')}</p>
              {event?.capacity && (
                <p className="mb-0"><strong>{t('liveBook.capacity')}</strong> {event.capacity}</p>
              )}
            </Card.Body>
          </Card>

        <div
          className="d-flex flex-wrap justify-content-center gap-2 mt-4"
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          {seats.map((seat) => (
            <div key={seat.id} style={{ position: 'relative' }}>
              <div
                onClick={() => handleClick(seat)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  backgroundColor: getColor(seat.status, selectedSeat === seat.id, seat.id),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.85rem',
                  cursor: seat.status === 'available' ? 'pointer' : 'not-allowed',
                  border: mySeat === seat.id ? '2px solid white' : 'none',
                  transition: 'transform 0.1s ease-in-out',
                }}
                title={t('liveBook.seatLabel', { id: seat.id })}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {seat.id}
              </div>
              
              {(seat.status === 'booked' || seat.status === 'pending') && (
                <Button
                  variant="light"
                  size="sm"
                  style={{
                    marginTop: 6,
                    position: 'relative',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '2px 8px',
                    fontSize: '0.65rem',
                    zIndex: 2
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNotify(seat);
                  }}
                >
                  {t('liveBook.notifyMeButton')}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <span className="me-3">
            <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#198754', marginRight: 5 }} /> {t('liveBook.yourBooking')}
          </span>
          <span className="me-3">
            <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#0d6efd', marginRight: 5 }} /> {t('liveBook.selected')}
          </span>
          <span className="me-3">
            <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#adb5bd', marginRight: 5 }} /> {t('liveBook.available')}
          </span>
          <span className="me-3">
            <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#dc3545', marginRight: 5 }} /> {t('liveBook.booked')}
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 20, height: 20, backgroundColor: '#0dcaf0', marginRight: 5 }} /> {t('liveBook.pending')}
          </span>
        </div>

        {error && <Alert variant="danger" className="mt-4">{error}</Alert>}
        {notifyMsg && <Alert variant="info" className="mt-4">{notifyMsg}</Alert>}

        {selectedSeat && (
          <div className="mt-4">
            <p><strong>{t('liveBook.selectedSeat')}</strong> {selectedSeat}</p>
            <Button className="bg-brown border-0" onClick={handleProceedToPayment}>
              {t('liveBook.proceedToPay')}
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default LiveBooking;
