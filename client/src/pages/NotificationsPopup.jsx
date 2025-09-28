// NotificationsPopup.jsx - Displays toast-style alerts for available slots
// Poll the server every 10s to check for triggered alerts

import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';

const NotificationPopup = () => {
  const [notifications, setNotifications] = useState([]);

  const getSeen = () => JSON.parse(localStorage.getItem('seenNotifications') || '[]');
  const addSeen = (id) => {
    const seen = getSeen();
    const updated = [...new Set([...seen, id])];
    localStorage.setItem('seenNotifications', JSON.stringify(updated));
  };
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await apiFetch('notification', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(t('notifs.error1'));

        const seen = getSeen();
        const unseen = data.filter(n => !seen.includes(n._id));
        if (unseen.length > 0) {
          setNotifications(unseen.slice(0, 3));
        }
      } catch (err) {
        console.error('Notification fetch error:', err.message);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = (id) => {
    addSeen(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const formatItemLabel = (itemId) => {
    const parts = itemId.split('__');
    if (parts.length === 3) {
      const [name, date, time] = parts;
      return t('notifs.itemLabel', { name, date, time });
    }
    return itemId;
  };

  return (
    <ToastContainer
      position={direction === 'rtl' ? 'top-start' : 'top-end'}
      className={`p-3 toast-${direction}`}
      style={{ zIndex: 9999, marginTop: '125px' }}
    >
      {notifications.map(n => (
        <Toast
          key={n._id}
          style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #ddd',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
          className="mb-3"
          delay={10000}
          onClose={() => handleClose(n._id)}
        >
          <Toast.Header>
            <strong className="me-auto">{t('notifs.title')}</strong>
          </Toast.Header>
          <Toast.Body style={{ color: '#333'}}>
            {n.type === 'event' ? (
              <>{t('notifs.seat')} <strong>#{n.details?.seat}</strong> {t('notifs.for')} <strong>{formatItemLabel(n.itemId)}</strong> {t('notifs.seatAvailable')}</>
            ) : (
              <>{t('notifs.venue')} <strong>{n.details?.name}</strong> {t('notifs.venueAvailable')} <strong>{n.details?.time}</strong>!</>
            )}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default NotificationPopup;
