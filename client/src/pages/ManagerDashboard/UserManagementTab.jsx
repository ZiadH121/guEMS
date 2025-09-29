// UserManagementTab.jsx – Approve organizers, manage roles

import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Alert, Form, Row, Col } from 'react-bootstrap';
import { apiFetch } from '../../utils/api';
import { unparse } from 'papaparse';
import { useTranslation } from 'react-i18next';

const UserManagementTab = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [organizerFilter, setOrganizerFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const token = localStorage.getItem('token');
  const { t } = useTranslation();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    document.title = `GEMS - ${t('titles.mgmtDashboard')}`;
  }, [t]);

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('userMgmt.error1'));
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const approveOrganizer = async (userId) => {
    try {
      const res = await apiFetch(`/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'organizer' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('userMgmt.error2'));

      setSuccess(`${t('userMgmt.success1')} ${data.user.name}`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const denyOrganizerRequest = async (userId) => {
  try {
    const res = await apiFetch(`/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role: 'visitor' })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('userMgmt.error3'));

    setSuccess(`${t('userMgmt.success2')} ${data.user.name}`);
    fetchUsers();
  } catch (err) {
    setError(err.message);
  }
};

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await apiFetch(`/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('userMgmt.error4'));

      setSuccess(`${t('userMgmt.success3')} ${data.user.name}`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirm = window.confirm(t('userMgmt.confirmDelete'));
    if (!confirm) return;

    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('userMgmt.error5'));

      setSuccess(t('userMgmt.success4'));
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    const matchesOrganizer =
      organizerFilter === 'all' ||
      (organizerFilter === 'yes' && u.organizerRequest) ||
      (organizerFilter === 'no' && !u.organizerRequest);

    return matchesSearch && matchesRole && matchesOrganizer;
  });

  const totalUsers = filteredUsers.length;
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  const handleExportCSV = () => {
  const exportData = filteredUsers.map(u => ({
    Name: u.name,
    Email: u.email,
    Role: u.role,
    OrganizerRequest: u.organizerRequest ? 'Yes' : 'No'
  }));

  const csv = unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'users.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div>
      <h4 className="text-center mb-3">{t('userMgmt.title')}</h4>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {success && <Alert variant="success" className="text-center">{success}</Alert>}

      <Card className="p-4 shadow-sm mb-4">
        <Row className="g-3">
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder={t('userMgmt.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">{t('userMgmt.filterTitle')}</option>
              <option value="visitor">{t('userMgmt.filterVisitor')}</option>
              <option value="organizer">{t('userMgmt.filterOrganizer')}</option>
              <option value="staff">{t('userMgmt.filterStaff')}</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Select value={organizerFilter} onChange={(e) => setOrganizerFilter(e.target.value)}>
              <option value="all">{t('userMgmt.filter2Title')}</option>
              <option value="yes">{t('userMgmt.filter2Reqd')}</option>
              <option value="no">{t('userMgmt.filter2NotReqd')}</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

        <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{t('userMgmt.title2')}</h5>
        <Button size="sm" variant="outline-dark" onClick={handleExportCSV}>
            {t('userMgmt.exportButton')}
        </Button>
        </div>

      <Card className="p-4 shadow-sm">
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>{t('userMgmt.tableName')}</th>
              <th>{t('userMgmt.tableEmail')}</th>
              <th>{t('userMgmt.tableRole')}</th>
              <th>{t('userMgmt.tableOrgReq')}</th>
              <th>{t('userMgmt.tableActions')}</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr><td colSpan="5" className="text-center">{t('userMgmt.noUsers')}</td></tr>
            ) : (
              currentUsers.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <Form.Select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      size="sm"
                    >
                      <option value="visitor">{t('userMgmt.roleVisitor')}</option>
                      <option value="organizer">{t('userMgmt.roleOrg')}</option>
                      <option value="staff">{t('userMgmt.roleStaff')}</option>
                    </Form.Select>
                  </td>
                  <td>{u.organizerRequest ? t('userMgmt.reqOrgYes') : t('userMgmt.reqOrgNo')}</td>
                  <td className="d-flex gap-2 flex-wrap">
                    {u.organizerRequest && u.role === 'visitor' && (
                      <Button size="sm" variant="success" onClick={() => approveOrganizer(u._id)}>
                        {t('userMgmt.approveButton')}
                      </Button>
                    )}
                    {u.organizerRequest && u.role === 'visitor' && (
                      <Button size="sm" variant="warning" onClick={() => denyOrganizerRequest(u._id)}>
                        {t('userMgmt.denyButton')}
                      </Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => handleDeleteUser(u._id)}>
                      {t('userMgmt.deleteButton')}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <span>{t('userMgmt.userCounter')} {totalUsers}</span>
          <div>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="me-2"
            >
              {t('userMgmt.previousButton')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={indexOfLast >= totalUsers}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              {t('userMgmt.nextButton')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserManagementTab;
