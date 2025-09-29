// Home.jsx - Landing page after login, brief overview and navigation
// Feature navigation blocks or highlights go here

// Home.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isVisitor = user.role === 'visitor';
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `GEMS - ${t('titles.home')}`;
  }, [t]);
  
  return (
    <div className="fade-in">
      <div style={container}>
        <div style={heroSection}>
          <h1 style={mainTitle}>{t('home.title')}</h1>
          <p style={subtitle}>{t('home.subtitle')}</p>
          <div style={buttonGroup}>
            <Link to="/ticket-booking" style={heroButton}>{t('home.bookEvent')}</Link>

            {!isVisitor && (
              <Link to="/venue-booking" style={heroButton}>{t('home.reserveVenue')}</Link>
            )}

            <Link to="/my-bookings" style={heroButton}>{t('home.myBookings')}</Link>

            {user.role === 'staff' && (
              <>
                <Link to="/metrics" style={heroButton}>{t('home.viewMetrics')}</Link>
                <Link to="/manager" style={heroButton}>{t('home.adminPanel')}</Link>
              </>
            )}
          </div>
        </div>

        <div style={section}>
          <h2 style={sectionTitle}>{t('home.whyTitle')}</h2>
          <p style={paragraph}>{t('home.whyText')}</p>
        </div>

        <div style={cardGrid}>
          <FeatureCard
            title={t('home.card1')}
            desc={t('home.card1desc')}
          />
          <FeatureCard
            title={t('home.card2')}
            desc={t('home.card2desc')}
          />
          <FeatureCard
            title={t('home.card3')}
            desc={t('home.card3desc')}
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, desc }) => (
  <div style={card}>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

// --- Styles ---
const container = {
  padding: '40px',
  fontFamily: 'Segoe UI, sans-serif',
  maxWidth: '1200px',
  margin: 'auto'
};

const heroSection = {
  textAlign: 'center',
  marginBottom: '50px'
};

const mainTitle = { 
  fontSize: '36px', 
  color: '#0D234B', 
  marginBottom: '10px' 
};

const subtitle = {
  fontSize: '18px',
  color: '#333',
  marginBottom: '20px'
};

const buttonGroup = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginTop: '20px'
};

const heroButton = {
  padding: '12px 24px',
  backgroundColor: '#0D234B',
  color: '#fff',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold'
};

const section = {
  textAlign: 'center',
  marginTop: '60px'
};

const sectionTitle = {
  fontSize: '28px',
  color: '#0D234B',
  marginBottom: '10px'
};

const paragraph = {
  fontSize: '16px',
  color: '#444',
  maxWidth: '800px',
  margin: 'auto'
};

const cardGrid = {
  display: 'flex',
  gap: '20px',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: '40px'
};

const card = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '20px',
  width: '280px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  textAlign: 'center'
};

const footer = {
  marginTop: '60px',
  textAlign: 'center',
  color: '#999',
  fontSize: '14px'
};

export default Home;
