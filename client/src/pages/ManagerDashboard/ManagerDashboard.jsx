// ManagerDashboard.jsx
// Tabbed interface for admin tasks: users, venues, feedback, bookings

import React, { useEffect } from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import UserManagementTab from './UserManagementTab';
// import VenueManagementTab from './VenueManagementTab';
// import FeedbackManagementTab from './FeedbackManagementTab';
// import BookingManagementTab from './BookingManagementTab';
import ProposalsTab from './ProposalsTab';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `GEMS - ${t('titles.mgmtDashboard')}`;
  }, [t]);

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-start mb-3">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>{t('mgmtDash.backButton')}</button>
      </div>

      <h2 className="text-center text-brown mb-4">{t('mgmtDash.title')}</h2>

      <Tabs defaultActiveKey="proposals" className="mb-3 custom-tabs" fill>
      <Tab eventKey="proposals" title={t('mgmtDash.proposals')}>
        <ProposalsTab />
      </Tab>
      {/*
      <Tab eventKey="users" title={t('mgmtDash.userMgmt')}>
        <UserManagementTab />
      </Tab>
      <Tab eventKey="venues" title={t('mgmtDash.venueMgmt')}>
        <VenueManagementTab />
      </Tab>
      <Tab eventKey="bookings" title={t('mgmtDash.bookingMgmt')}>
        <BookingManagementTab />
      </Tab>
      <Tab eventKey="feedback" title={t('mgmtDash.feedbackMgmt')}>
        <FeedbackManagementTab />
      </Tab>
      */}
    </Tabs>
    </Container>
  );
};

export default ManagerDashboard;
