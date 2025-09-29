// FeedbackManagementTab.jsx – View and moderate user feedback

import React, { useEffect, useState } from 'react';
import { Card, Table, Alert, Badge, Form, Row, Col, Button } from 'react-bootstrap';
import { apiFetch } from '../../utils/api';
import { unparse } from 'papaparse';
import { useTranslation } from 'react-i18next';

const FeedbackManagementTab = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const token = localStorage.getItem('token');
  const { t } = useTranslation();  

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    document.title = `GEMS - ${t('titles.mgmtDashboard')}`;
  }, [t]);

  const fetchFeedback = async () => {
    try {
      const res = await apiFetch('/feedback', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('fdbckMgmt.error1'));
      setFeedbackList(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count);

  const handleFlagToggle = async (id) => {
    try {
      const res = await apiFetch(`/feedback/${id}/flag`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchFeedback();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(t('fdbckMgmt.confirmationMsg'));
    if (!confirm) return;

    try {
      const res = await apiFetch(`/feedback/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchFeedback();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = feedbackList.filter(f =>
    typeFilter === 'all' || f.feedbackType === typeFilter
  );

  const handleExportCSV = () => {
  const exportData = filtered.map(f => ({
    User: f.user?.name || 'Unknown',
    Email: f.user?.email || 'N/A',
    Type: f.feedbackType,
    BookingType: f.booking?.type || 'Unknown',
    BookingName: f.booking?.details?.event || f.booking?.details?.name || '—',
    Rating: f.feedbackType === 'rating' ? f.rating : '',
    Comment: f.comment || '',
    Flagged: f.flagged ? 'Yes' : 'No',
    Submitted: new Date(f.createdAt).toLocaleString()
  }));

  const csv = unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'feedback.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div>
      <h4 className="text-center mb-3">{t('fdbckMgmt.title')}</h4>
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      <Card className="p-4 shadow-sm mb-4">
        <Row>
          <Col md={4}>
            <Form.Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">{t('fdbckMgmt.filterTitle')}</option>
              <option value="rating">{t('fdbckMgmt.ratingsFilter')}</option>
              <option value="cancellation">{t('fdbckMgmt.cancellationFilter')}</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

        <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{t('fdbckMgmt.title2')}</h5>
        <Button size="sm" variant="outline-dark" onClick={handleExportCSV}>
            {t('fdbckMgmt.exportButton')}
        </Button>
        </div>

      <Card className="p-4 shadow-sm">
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>{t('fdbckMgmt.labelUser')}</th>
              <th>{t('fdbckMgmt.labelType')}</th>
              <th>{t('fdbckMgmt.labelBooking')}</th>
              <th>{t('fdbckMgmt.labelComment')}</th>
              <th>{t('fdbckMgmt.labelRating')}</th>
              <th>{t('fdbckMgmt.labelFlag')}</th>
              <th>{t('fdbckMgmt.labelActions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" className="text-center">{t('fdbckMgmt.noFeedback')}</td></tr>
            ) : (
              filtered.map(f => (
                <tr key={f._id}>
                  <td>{f.user?.name || t('fdbckMgmt.unknown')}</td>
                  <td>
                    <Badge bg={f.feedbackType === 'rating' ? 'primary' : 'warning'}>
                      {t(`fdbckMgmt.${f.feedbackType}`)}
                    </Badge>
                  </td>
                  <td>
                    {f.booking?.type === 'event' ? t('fdbckMgmt.bookingEvent') : t('fdbckMgmt.bookingVenue')}<br />
                    {f.booking?.details?.event || f.booking?.details?.name || '—'}
                  </td>
                  <td>{f.comment || <span className="text-muted">{t('fdbckMgmt.noComment')}</span>}</td>
                  <td>
                    {f.feedbackType === 'rating' && f.rating
                      ? <span style={{ color: '#f7b100' }}>{renderStars(f.rating)}</span>
                      : '—'}
                  </td>
                  <td>
                    <Badge bg={f.flagged ? 'danger' : 'secondary'}>
                      {f.flagged ? t('fdbckMgmt.flagged') : t('fdbckMgmt.clean')}
                    </Badge>
                  </td>
                  <td className="d-flex gap-2 flex-wrap">
                    <Button size="sm" variant={f.flagged ? 'outline-danger' : 'outline-warning'} onClick={() => handleFlagToggle(f._id)}>
                      {f.flagged ? t('fdbckMgmt.unflag') : t('fdbckMgmt.flag')}
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(f._id)}>
                      {t('fdbckMgmt.deleteButton')}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default FeedbackManagementTab;
