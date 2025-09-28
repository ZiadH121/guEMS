// About.jsx - Describes the project, team, and contact details
// Static content page showing about info

import React, { useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    document.title = `GIP - ${t('titles.about')}`;
  }, [t]);

  return (
    <div className="fade-in">
    <Container className="py-5" style={{ maxWidth: '900px' }}>
      <div className="d-flex justify-content-start mb-3">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          {t('about.backButton')}
        </Button>
      </div>      
      <h1 className="text-brown text-center mb-4">{t('about.title')}</h1>
      <p className="text-center mb-5">
        {t('about.subtitle')}
      </p>

      <section className="mb-4">
        <h4 className="text-brown">{t('about.header1')}</h4>
        <p>
          {t('about.subheader1')}
        </p>
      </section>

      <section className="mb-4">
        <h4 className="text-brown">{t('about.header2')}</h4>
        <p>
          {t('about.subheader2')}
        </p>
      </section>

      <section className="mb-4">
        <h4 className="text-brown">{t('about.header3')}</h4>
        <ul>
          <li>{t('about.subheader3')}</li>
          <li>{t('about.subheader4')}</li>
          <li>{t('about.subheader5')}</li>
          <li>{t('about.subheader6')}</li>
        </ul>
      </section>

      <section>
        <h4 className="text-brown">{t('about.header4')}</h4>
        <p>
          <strong>{t('about.email')}</strong> {t('about.subheader7')}<br />
          <strong>{t('about.phone')}</strong> {t('about.subheader8')}<br />
          <strong>{t('about.location')}</strong> {t('about.subheader9')}
        </p>
      </section>
    </Container>
    </div>
  );
};

export default About;
