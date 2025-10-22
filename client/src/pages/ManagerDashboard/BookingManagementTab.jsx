// BookingManagementTab.jsx – GEMS Event Booking Management (Improved UX + CSV Export)
import React, { useEffect, useState } from 'react';
import { Table, Button, Alert, Spinner, Form, Modal, Pagination } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../utils/api';
import { saveAs } from 'file-saver';
import { FaEye, FaFileCsv, FaTrash } from 'react-icons/fa';

const ITEMS_PER_PAGE = 10;

const BookingManagementTab = () => {
  const { t } = useTranslation();
  const [totalPages, setTotalPages] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
      document.title = `GEMS - ${t('titles.mgmtDashboard')}`;
    }, [t]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await apiFetch(`/admin/bookings?type=event&page=${currentPage}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings');
      setBookings(data.bookings || []);
      setTotalPages(data.pagination?.totalPages || 1);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
}, [currentPage]);

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      !search ||
      b.details?.event?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const grouped = filtered.reduce((acc, b) => {
    const eventName = b.details?.event || 'Unnamed Event';
    if (!acc[eventName]) acc[eventName] = [];
    acc[eventName].push(b);
    return acc;
  }, {});

  const events = Object.keys(grouped).map((name) => {
    const creator = grouped[name][0].details?.creator || grouped[name][0].user;
    const venue = grouped[name][0].details?.venue || '—';
    const date = grouped[name][0].details?.date || '—';
    const capacity = grouped[name][0].details?.capacity || 0;
    const confirmed = grouped[name].filter((b) => b.status === 'confirmed' && b.user?.role !== 'staff').length;
    return {
      name,
      venue,
      date,
      capacity,
      booked: confirmed,
      creator,
      list: grouped[name]
    };
  });

  const paginated = events.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExportCSV = async (eventName) => {
    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch(`/bookings/export/${encodeURIComponent(eventName)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      saveAs(blob, `${eventName}_attendees.csv`);
    } catch {
      alert(t('bkngMgmt.exportError'));
    }
  };

  const handleExportAllEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await apiFetch(`/bookings/export-events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      saveAs(blob, `GEMS_Events_List.csv`);
    } catch {
      alert(t('bkngMgmt.exportError'));
    }
  };

  const openModal = (event) => {
    setSelectedEvent(event);
    setModalLoading(true);
    setShowModal(true);

    const filteredAttendees = event.list.filter(
      (a) => a.user?.role !== 'staff' && a.user?.role !== 'admin'
    );
    setAttendees(filteredAttendees);
    setModalLoading(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setAttendees([]);
  };

  const handleCancel = async (id) => {
    if (!window.confirm(t('bkngMgmt.cancelConfirm'))) return;
    try {
      const res = await apiFetch(`/bookings/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fade-in">
      <h4 className="text-center mb-4">{t('bkngMgmt.title')}</h4>
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      <Form className="d-flex flex-wrap justify-content-center align-items-center mb-4 gap-2">
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
        <Button variant="outline-success" size="sm" onClick={handleExportAllEvents}>
          <FaFileCsv className="me-1" /> {t('bkngMgmt.exportEvents')}
        </Button>
      </Form>

      {loading ? (
        <Spinner animation="border" className="d-block mx-auto mt-5" />
      ) : events.length === 0 ? (
        <p className="text-center text-muted">{t('bkngMgmt.noBookings')}</p>
      ) : (
        <>
          <Table bordered hover responsive className="align-middle shadow-sm">
            <thead className="table-light">
              <tr>
                <th>{t('bkngMgmt.event')}</th>
                <th>{t('bkngMgmt.venue')}</th>
                <th>{t('bkngMgmt.date')}</th>
                <th>{t('bkngMgmt.creator')}</th>
                <th>{t('bkngMgmt.booked')}</th>
                <th className="text-center">{t('bkngMgmt.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((ev) => (
                <tr key={ev.name}>
                  <td>{ev.name}</td>
                  <td>{ev.venue}</td>
                  <td>{new Date(ev.date).toLocaleDateString()}</td>
                  <td>{ev.creator?.name || '—'}</td>
                  <td>{`${ev.booked} / ${ev.capacity}`}</td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => openModal(ev)}
                    >
                      <FaEye className="me-1" /> {t('bkngMgmt.view')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleExportCSV(ev.name)}
                    >
                      <FaFileCsv className="me-1" /> {t('bkngMgmt.exportCSV')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              />
            </Pagination>
          )}
        </>
      )}

      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedEvent ? `${selectedEvent.name} — ${t('bkngMgmt.view')}` : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalLoading ? (
            <Spinner animation="border" className="d-block mx-auto mt-3" />
          ) : attendees.length === 0 ? (
            <p className="text-center text-muted">{t('bkngMgmt.noBookings')}</p>
          ) : (
            <Table bordered hover responsive className="align-middle">
              <thead>
                <tr>
                  <th>{t('bkngMgmt.seat')}</th>
                  <th>{t('bkngMgmt.user')}</th>
                  <th>{t('bkngMgmt.email')}</th>
                  <th>{t('bkngMgmt.status')}</th>
                  <th>{t('bkngMgmt.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((a) => (
                  <tr key={a._id}>
                    <td>{a.details?.seat || '—'}</td>
                    <td>{a.user?.name || '—'}</td>
                    <td>{a.user?.email || '—'}</td>
                    <td>{t(`bkngMgmt.statuses.${a.status}`)}</td>
                    <td>
                      {a.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleCancel(a._id)}
                        >
                          <FaTrash className="me-1" /> {t('bkngMgmt.cancel')}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedEvent && (
            <Button
              variant="outline-success"
              onClick={() => handleExportCSV(selectedEvent.name)}
            >
              <FaFileCsv className="me-1" /> {t('bkngMgmt.exportCSV')}
            </Button>
          )}
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingManagementTab;
