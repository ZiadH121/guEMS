// VenueManagementTab.jsx – Manages venue add/edit/delete

import React, { useEffect, useState } from 'react';
import {
  Card, Table, Button, Alert, Form, Row, Col, Image
} from 'react-bootstrap';
import { apiFetch } from '../../utils/api';
import { useTranslation } from 'react-i18next';

const VenueManagementTab = () => {
  const [venues, setVenues] = useState([]);
  const [newVenue, setNewVenue] = useState({
    name: '', date: '', capacity: '', availability: 'Available', price: '', image: ''
  });
  const [editVenueId, setEditVenueId] = useState(null);
  const [editVenueData, setEditVenueData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');
  const { t } = useTranslation();

  const isValidImageUrl = (url) =>
    url && /\.(jpg|jpeg|png|webp|gif)$/i.test(url.trim());

  const isValidDate = (dateStr) => {
    const today = new Date();
    const inputDate = new Date(dateStr);
    const futureLimit = new Date();
    futureLimit.setFullYear(today.getFullYear() + 1);
    return inputDate >= today && inputDate <= futureLimit;
  };

  const formatDate = (rawDate) => {
    const date = new Date(rawDate);
    return date.toLocaleDateString('en-GB');
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    document.title = `GIP - ${t('titles.mgmtDashboard')}`;
  }, [t]);

  const fetchVenues = async () => {
    try {
      const res = await apiFetch('/venues', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('venueMgmt.error1'));
      setVenues(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddVenue = async () => {
    const { image, date } = newVenue;

    if (!isValidImageUrl(image)) {
      setError(t('venueMgmt.error2'));
      return;
    }

    if (!isValidDate(date)) {
      setError(t('venueMgmt.error3'));
      return;
    }

    const defaultSlots = [
      "8:00 AM - 10:00 AM",
      "10:00 AM - 12:00 PM",
      "12:00 PM - 2:00 PM",
      "2:00 PM - 4:00 PM",
      "4:00 PM - 6:00 PM"
    ];

    const formattedVenue = {
      ...newVenue,
      price: newVenue.price.startsWith('$') ? newVenue.price : `$${newVenue.price}`,
      details: { slots: defaultSlots }
    };

    try {
      const res = await apiFetch('/venues', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedVenue)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(t('venueMgmt.success1'));
      setNewVenue({
        name: '', date: '', capacity: '', availability: 'Available', price: '', image: ''
      });
      fetchVenues();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVenue = async (id) => {
    if (!window.confirm(t('venueMgmt.confirmDelete'))) return;
    try {
      const res = await apiFetch(`/venues/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(t('venueMgmt.success2'));
      fetchVenues();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditVenue = (venue) => {
    setEditVenueId(venue._id);
    setEditVenueData({ ...venue });
  };

  const handleCancelEdit = () => {
    setEditVenueId(null);
    setEditVenueData({});
  };

  const handleSaveEdit = async () => {
    const { image, date } = editVenueData;

    if (!isValidImageUrl(image)) {
      setError(t('venueMgmt.error4'));
      return;
    }

    if (!isValidDate(date)) {
      setError(t('venueMgmt.error5'));
      return;
    }

    const formatted = {
      ...editVenueData,
      price: editVenueData.price.startsWith('$')
        ? editVenueData.price
        : `$${editVenueData.price}`
    };

    try {
      const res = await apiFetch(`/venues/${editVenueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formatted)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(t('venueMgmt.success3'));
      setEditVenueId(null);
      setEditVenueData({});
      fetchVenues();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {success && <Alert variant="success" className="text-center">{success}</Alert>}

      <h5 className="text-center mb-3">{t('venueMgmt.title')}</h5>
      <Card className="p-4 shadow-sm mb-4">
        <Row className="g-2">
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder={t('venueMgmt.namePlaceholder')}
              value={newVenue.name}
              onChange={e => setNewVenue({ ...newVenue, name: e.target.value })}
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="date"
              value={newVenue.date}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
              onChange={e => setNewVenue({ ...newVenue, date: e.target.value })}
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="number"
              placeholder={t('venueMgmt.capacityPlaceholder')}
              value={newVenue.capacity}
              onChange={e => setNewVenue({ ...newVenue, capacity: e.target.value })}
            />
          </Col>
          <Col md={4}>
            <Form.Select
              value={newVenue.availability}
              onChange={e => setNewVenue({ ...newVenue, availability: e.target.value })}
            >
              <option value="Available">{t('venueMgmt.available')}</option>
              <option value="Unavailable">{t('venueMgmt.unavailable')}</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder={t('venueMgmt.pricePlaceholder')}
              value={newVenue.price}
              onChange={e => setNewVenue({ ...newVenue, price: e.target.value })}
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder={t('venueMgmt.imagePlaceholder')}
              value={newVenue.image}
              onChange={e => setNewVenue({ ...newVenue, image: e.target.value })}
            />
          </Col>
          <Col md={12}>
            <Button onClick={handleAddVenue} className="bg-brown w-100 mt-2">
              {t('venueMgmt.addVenueButton')}
            </Button>
          </Col>
        </Row>
      </Card>

      <h5 className="text-center mb-3">{t('venueMgmt.title2')}</h5>
      <Card className="p-4 shadow-sm">
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>{t('venueMgmt.tableName')}</th>
              <th>{t('venueMgmt.tableDate')}</th>
              <th>{t('venueMgmt.tableCapacity')}</th>
              <th>{t('venueMgmt.tablePrice')}</th>
              <th>{t('venueMgmt.tableStatus')}</th>
              <th>{t('venueMgmt.tableImage')}</th>
              <th>{t('venueMgmt.tableImageURL')}</th>
              <th>{t('venueMgmt.tableActions')}</th>
            </tr>
          </thead>
          <tbody>
            {venues.map(venue => (
              <tr key={venue._id}>
                {editVenueId === venue._id ? (
                  <>
                    <td><Form.Control value={editVenueData.name} onChange={e => setEditVenueData({ ...editVenueData, name: e.target.value })} /></td>
                    <td>
                      <Form.Control
                        type="date"
                        value={editVenueData.date}
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                        onChange={e => setEditVenueData({ ...editVenueData, date: e.target.value })}
                      />
                    </td>
                    <td><Form.Control value={editVenueData.capacity} onChange={e => setEditVenueData({ ...editVenueData, capacity: e.target.value })} /></td>
                    <td><Form.Control value={editVenueData.price} onChange={e => setEditVenueData({ ...editVenueData, price: e.target.value })} /></td>
                    <td><Form.Select
                          value={editVenueData.status}
                          onChange={e => setEditVenueData({ ...editVenueData, status: e.target.value })}
                        >
                          <option value="Available">{t('venueMgmt.status.Available')}</option>
                          <option value="Booked">{t('venueMgmt.status.Booked')}</option>
                          <option value="Unavailable">{t('venueMgmt.status.Unavailable')}</option>
                        </Form.Select></td>
                    <td>
                      <Image src={editVenueData.image} alt="preview" width="60" height="40" rounded />
                    </td>
                    <td>
                      <Form.Control value={editVenueData.image} onChange={e => setEditVenueData({ ...editVenueData, image: e.target.value })} />
                    </td>
                    <td>
                      <Button size="sm" onClick={handleSaveEdit} className="me-2 bg-success">{t('venueMgmt.saveButton')}</Button>
                      <Button size="sm" variant="secondary" onClick={handleCancelEdit}>{t('venueMgmt.cancelButton')}</Button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{venue.name}</td>
                    <td>{formatDate(venue.date)}</td>
                    <td>{venue.capacity}</td>
                    <td>{venue.price}</td>
                    <td>{t(`venueMgmt.status.${venue.status}`)}</td>
                    <td>{venue.image && <Image src={venue.image} alt="venue" width="60" height="40" rounded />}</td>
                    <td>{venue.image}</td>
                    <td>
                      <Button size="sm" variant="info" className="me-2" onClick={() => handleEditVenue(venue)}>{t('venueMgmt.editButton')}</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteVenue(venue._id)}>{t('venueMgmt.deleteButton')}</Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default VenueManagementTab;
