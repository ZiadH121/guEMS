// BookingConfirmation.jsx - Displays a summary after successful booking/payment
// Renders user’s booking data passed via router

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import useRouteGuard from '../hooks/useRouteGuard';
import { useTranslation } from 'react-i18next';

const BookingConfirmation = () => {
  useRouteGuard(['items']);
  const location = useLocation();
  const navigate = useNavigate();
  const type = location.state?.type || 'event';
  const booking = location.state?.items || [];
  
  const { t } = useTranslation();

  const handleGoBack = () => {
    if (type === 'event') navigate('/ticket-booking');
    else navigate('/venue-booking');
  };

  useEffect(() => {
    document.title = `GEMS - ${t('titles.bookConfirm')}`;
  }, [t]);

  return (
    <div className="fade-in">
      <Container className="py-5" style={{ maxWidth: '700px' }}>
        <Card className="p-4 shadow-sm">
          <h3 className="text-center text-success mb-4">{t('bookingConfirmation.title')}</h3>

          <h5>{t('bookingConfirmation.title2')}</h5>
          <ul>
            {booking.map((item, idx) => (
              <li key={idx} className="mb-2">
                {type === 'event' ? (
                  <>
                    {t('bookingConfirmation.seat')} #{item.seat}
                  </>

                ) : (
                  <>
                    <strong>{item.name}</strong><br />
                    {t('bookingConfirmation.date')} {item.date} <br />
                    {t('bookingConfirmation.time')}: {item.time} <br />
                    {t('bookingConfirmation.price')} {item.price || 'N/A'}
                  </>
                )}
              </li>
            ))}
          </ul>

          <div className="text-center mt-4">
            <Button variant="outline-success" onClick={handleGoBack}>
                {type === 'event'
                  ? t('bookingConfirmation.bookAnotherTicket')
                  : t('bookingConfirmation.bookAnotherVenue')}
            </Button>
            <Button
              variant="outline-success"
              className="ms-2"
              onClick={() => navigate('/')}
            >
              {t('bookingConfirmation.home')}
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default BookingConfirmation;
