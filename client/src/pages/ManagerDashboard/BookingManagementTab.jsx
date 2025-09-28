import React, { useEffect, useState } from 'react';
import { Card, Table, Alert, Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { apiFetch } from '../../utils/api';
import { unparse } from 'papaparse';
import { useTranslation } from 'react-i18next';

const BookingManagementTab = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  const token = localStorage.getItem('token');
  const { t } = useTranslation();  

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    document.title = `GIP - ${t('titles.mgmtDashboard')}`;
  }, [t]);

  const fetchBookings = async () => {
    try {
      const res = await apiFetch('/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('bkngMgmt.error1'));
      setBookings(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelBooking = async (id) => {
    const confirm = window.confirm(t('bkngMgmt.confirmationMsg'));
    if (!confirm) return;

    try {
      const res = await apiFetch(`/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = bookings.filter(b =>
    (typeFilter === 'all' || b.type === typeFilter) &&
    (statusFilter === 'all' || b.status === statusFilter)
  );

  const totalBookings = filtered.length;
  const indexOfLast = currentPage * bookingsPerPage;
  const indexOfFirst = indexOfLast - bookingsPerPage;
  const currentBookings = filtered.slice(indexOfFirst, indexOfLast);

  const handleExportCSV = () => {
    const exportData = filtered.map(b => ({
      User: b.user?.name || 'Unknown',
      Email: b.user?.email || 'N/A',
      Type: b.type,
      Booking: b.type === 'event' ? b.details?.event : b.details?.name,
      SeatOrSlot: b.details?.seat || b.details?.time || (b.details?.slots || []).join(', '),
      Status: b.status,
      Date: b.details?.date || '',
      CreatedAt: new Date(b.createdAt).toLocaleString()
    }));

    const csv = unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h4 className="text-center mb-3">{t('bkngMgmt.title')}</h4>
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      <Card className="p-4 shadow-sm mb-4">
        <Row className="g-3">
          <Col md={4}>
            <Form.Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">{t('bkngMgmt.types')}</option>
              <option value="event">{t('bkngMgmt.event')}</option>
              <option value="venue">{t('bkngMgmt.venue')}</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{t('bkngMgmt.filterTitle')}</option>
              <option value="confirmed">{t('bkngMgmt.filterConfirmed')}</option>
              <option value="pending">{t('bkngMgmt.filterPending')}</option>
              <option value="cancelled">{t('bkngMgmt.filterCancelled')}</option>
            </Form.Select>
          </Col>
          <Col md={4} className="text-end">
            <Button variant="outline-dark" size="sm" onClick={handleExportCSV}>
              {t('bkngMgmt.exportButton')}
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="p-4 shadow-sm">
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>{t('bkngMgmt.user')}</th>
              <th>{t('bkngMgmt.type')}</th>
              <th>{t('bkngMgmt.details')}</th>
              <th>{t('bkngMgmt.status')}</th>
              <th>{t('bkngMgmt.bookedOn')}</th>
              <th>{t('bkngMgmt.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length === 0 ? (
              <tr><td colSpan="6" className="text-center">{t('bkngMgmt.title2')}</td></tr>
            ) : (
              currentBookings.map(b => (
                <tr key={b._id}>
                  <td>{b.user?.name || t('bkngMgmt.unknown')}<br /><small>{b.user?.email}</small></td>
                  <td>
                    <Badge bg={b.type === 'event' ? 'info' : 'secondary'}>
                      {t(`bkngMgmt.${b.type}`)}
                    </Badge>
                  </td>
                  <td>
                    {b.type === 'event' ? (
                      <>
                        {t('bkngMgmt.eventLabel')} {b.details?.event || '—'}<br />
                        {t('bkngMgmt.seatLabel')} {b.details?.seat}
                      </>
                    ) : (
                      <>
                        {t('bkngMgmt.venueLabel')} {b.details?.name}<br />
                        {t('bkngMgmt.dateLabel')} {b.details?.date}<br />
                        {t('bkngMgmt.timeLabel')} {Array.isArray(b.details?.slots)
                          ? b.details.slots.join(', ')
                          : b.details?.time}
                      </>
                    )}
                  </td>
                  <td>
                    <Badge bg={
                      b.status === 'confirmed' ? 'success'
                        : b.status === 'pending' ? 'warning'
                        : 'danger'
                    }>
                      {t(`bkngMgmt.status.${b.status}`)}
                    </Badge>
                  </td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                  <td>
                    {b.status !== 'cancelled' && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleCancelBooking(b._id)}
                      >
                        {t('bkngMgmt.cancelButton')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <span>{t('bkngMgmt.totalBookings')} {totalBookings}</span>
          <div>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="me-2"
            >
              {t('bkngMgmt.previous')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={indexOfLast >= totalBookings}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
               {t('bkngMgmt.next')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BookingManagementTab;
