// Navbar.jsx
// Responsive navbar with RTL support and translation integration

import React, { useState } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleFlag } from 'react-circle-flags';

const AppNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isVisitor = user.role === 'visitor';
  const isRTL = i18n.language === 'ar';

  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setExpanded(false);
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  const navLinks = [
    { path: '/', label: t('navbar.home') },
    { path: '/ticket-booking', label: t('navbar.bookTickets') },
    { path: '/venue-booking', label: t('navbar.bookVenue') },
    // { path: '/metrics', label: t('navbar.metrics') },
    // { path: '/about', label: t('navbar.about') },
    // { path: '/my-bookings', label: t('navbar.myBookings') },
    { path: '/manager', label: t('navbar.managerPanel') },
    { path: '/submit-proposal', label: t('navbar.submitProposal'), role: 'organizer' },
  ];

  const LanguageSwitcher = () => {
    const currentLang = i18n.language;
    return (
      <Dropdown className="mx-2">
        <Dropdown.Toggle variant="outline-light" size="sm" id="language-dropdown">
          <CircleFlag countryCode={currentLang === 'ar' ? 'eg' : 'gb'} height="20" className="me-2" />
          {currentLang === 'ar' ? 'العربية' : 'English'}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => i18n.changeLanguage('en')}>
            <CircleFlag countryCode="gb" height="20" className="me-2" /> English
          </Dropdown.Item>
          <Dropdown.Item onClick={() => i18n.changeLanguage('ar')}>
            <CircleFlag countryCode="eg" height="20" className="me-2" /> العربية
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const roleLabels = {
    visitor: t('roles.visitor'),
    staff: t('roles.staff'),
    organizer: t('roles.organizer')
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar
        expand="lg"
        className="custom-navbar shadow-sm bg-custom"
        variant="dark"
        expanded={expanded}
      >
        <Container fluid>
          <Navbar.Brand
            as={Link}
            to="/"
            className="fw-bold"
          >
            {t('navbar.title')}
          </Navbar.Brand>

          <Navbar.Toggle
            onClick={() => setExpanded(!expanded)}
            aria-controls="main-navbar"
          />

          <Navbar.Collapse id="main-navbar">
            <Nav className={`align-items-center ${isRTL ? 'me-auto' : 'ms-auto'} px-3 gap-2`}>
              {token ? (
                <>
                  {navLinks.map(link => {
                    if (link.path === '/venue-booking' && isVisitor) return null;
                    if (link.path === '/metrics' && user.role !== 'staff') return null;
                    if (link.path === '/manager' && user.role !== 'staff') return null;
                    if (link.path === '/submit-proposal' && isVisitor) return null;

                    return (
                      <Nav.Link
                        key={link.path}
                        as={Link}
                        to={link.path}
                        onClick={handleNavClick}
                        active={location.pathname === link.path}
                        className={`py-2 ${location.pathname === link.path ? 'fw-semibold text-warning' : ''}`}
                      >
                        {link.label}
                      </Nav.Link>
                    );
                  })}

                  <span className="text-white small py-2">
                    {t('navbar.role')}: <strong>{roleLabels[user.role]}</strong>
                  </span>

                  <Nav.Link
                    onClick={handleLogout}
                    className="text-danger fw-semibold py-2"
                  >
                    {t('navbar.logout')}
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link
                    as={Link}
                    to="/login"
                    onClick={handleNavClick}
                    className={`py-2 ${location.pathname === '/login' ? 'fw-semibold text-warning' : ''}`}
                  >
                    {t('navbar.login')}
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/register"
                    onClick={handleNavClick}
                    className={`py-2 ${location.pathname === '/register' ? 'fw-semibold text-warning' : ''}`}
                  >
                    {t('navbar.register')}
                  </Nav.Link>
                </>
              )}
              {/* <LanguageSwitcher /> */}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default AppNavbar;
