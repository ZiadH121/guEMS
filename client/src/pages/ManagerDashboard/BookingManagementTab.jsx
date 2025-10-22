// BookingManagementTab.jsx – View all event bookings and manage them
import React, { useEffect, useState } from 'react';
import { Table, Button, Alert, Spinner, Tabs, Tab, Form, Accordion } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../utils/api';
import { saveAs } from 'file-saver';

const BookingManagementTab = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = `GEMS - ${t('titles.mgmtDashboard')}`;
  }, [t]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await apiFetch(`/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleExportCSV = async (eventId, eventName) => {
    try {
      const res = await apiFetch(`/bookings/export/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const blob = await res.blob();
      saveAs(blob, `${eventName}_attendees.csv`);
    } catch {
      alert(t('bkngMgmt.exportError'));
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm(t('bkngMgmt.cancelConfirm'))) return;
    try {
      const res = await apiFetch(`/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterType !== 'all' && b.type !== filterType) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search && !(
      b.details?.event?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(search.toLowerCase())
    )) return false;
    return true;
  });

  const groupedEvents = filteredBookings
    .filter((b) => b.type === 'event')
    .reduce((acc, b) => {
      const eventName = b.details?.event || 'Unnamed Event';
      if (!acc[eventName]) acc[eventName] = [];
      acc[eventName].push(b);
      return acc;
    }, {});

  const venueBookings = filteredBookings.filter((b) => b.type === 'venue');

  return (
    <div className="fade-in">
      <h4 className="text-center mb-4">{t('bkngMgmt.title')}</h4>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      <Form className="d-flex flex-wrap justify-content-center mb-4 gap-2">
        <Form.Control
          type="text"
          placeholder={t('bkngMgmt.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '250px' }}
        />
        <Form.Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ maxWidth: '180px' }}
        >
          <option value="all">{t('bkngMgmt.filterAll')}</option>
          <option value="confirmed">{t('bkngMgmt.filterConfirmed')}</option>
          <option value="pending">{t('bkngMgmt.filterPending')}</option>
          <option value="cancelled">{t('bkngMgmt.filterCancelled')}</option>
        </Form.Select>
      </Form>

      <Tabs defaultActiveKey="events" className="mb-3 justify-content-center">
        <Tab eventKey="events" title={t('bkngMgmt.tabEvents')}>
          {loading ? (
            <Spinner animation="border" className="d-block mx-auto mt-4" />
          ) : Object.keys(groupedEvents).length === 0 ? (
            <p className="text-center text-muted">{t('bkngMgmt.noBookings')}</p>
          ) : (
            <Accordion>
              {Object.entries(groupedEvents).map(([eventName, list]) => (
                <Accordion.Item eventKey={eventName} key={eventName}>
                  <Accordion.Header>{eventName}</Accordion.Header>
                  <Accordion.Body>
                    <div className="d-flex justify-content-end mb-2">
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleExportCSV(list[0]._id, eventName)}
                      >
                        {t('bkngMgmt.exportCSV')}
                      </Button>
                    </div>
                    <Table bordered hover responsive>
                      <thead>
                        <tr>
                          <th>{t('bkngMgmt.user')}</th>
                          <th>{t('bkngMgmt.email')}</th>
                          <th>{t('bkngMgmt.seat')}</th>
                          <th>{t('bkngMgmt.date')}</th>
                          <th>{t('bkngMgmt.status')}</th>
                          <th>{t('bkngMgmt.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((b) => (
                          <tr key={b._id}>
                            <td>{b.user?.name || '—'}</td>
                            <td>{b.user?.email || '—'}</td>
                            <td>{b.details?.seat || '—'}</td>
                            <td>{new Date(b.details?.date).toLocaleDateString()}</td>
                            <td>{t(`bkngMgmt.statuses.${b.status}`)}</td>
                            <td>
                              {b.status !== 'cancelled' && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleCancel(b._id)}
                                >
                                  {t('bkngMgmt.cancel')}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </Tab>

        <Tab eventKey="venues" title={t('bkngMgmt.tabVenues')}>
          {loading ? (
            <Spinner animation="border" className="d-block mx-auto mt-4" />
          ) : venueBookings.length === 0 ? (
            <p className="text-center text-muted">{t('bkngMgmt.noBookings')}</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>{t('bkngMgmt.venueTitle')}</th>
                  <th>{t('bkngMgmt.date')}</th>
                  <th>{t('bkngMgmt.time')}</th>
                  <th>{t('bkngMgmt.user')}</th>
                  <th>{t('bkngMgmt.status')}</th>
                </tr>
              </thead>
              <tbody>
                {venueBookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.details?.venue || '—'}</td>
                    <td>{new Date(b.details?.date).toLocaleDateString()}</td>
                    <td>{b.details?.time || '—'}</td>
                    <td>{b.user?.name || '—'}</td>
                    <td>{t(`bkngMgmt.statuses.${b.status}`)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default BookingManagementTab;
