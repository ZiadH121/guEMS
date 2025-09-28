// NotFound.jsx - 404 page displayed for unknown routes

import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
    const { t } = useTranslation();
  
  useEffect(() => {
    document.title = `GIP - ${t('titles.notFound')}`;
  }, [t]);

  return (
    <Container className="text-center py-5">
      <h1 className="display-4 text-brown">404</h1>
      <p className="lead">{t('notFound.message')}</p>
      <Link to="/" className="btn bg-brown mt-3">{t('notFound.home')}</Link>
    </Container>
  );
};

export default NotFound;
