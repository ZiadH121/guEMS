// ProposalsTab.jsx
import React, { useEffect, useState } from 'react';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../utils/api';

const ProposalsTab = () => {
  const { t } = useTranslation();
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/proposals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProposals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await apiFetch(`/proposals/${id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchProposals();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <div>
      <h4 className="text-center mb-3">{t('proposal.reviewTitle')}</h4>
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t('proposal.colTitle')}</th>
            <th>{t('proposal.colProposer')}</th>
            <th>{t('proposal.colVenue')}</th>
            <th>{t('proposal.colDate')}</th>
            <th>{t('proposal.colCapacity')}</th>
            <th>{t('proposal.colStatus')}</th>
            <th>{t('proposal.colActions')}</th>
          </tr>
        </thead>
        <tbody>
          {proposals.length === 0 ? (
            <tr><td colSpan="7" className="text-center">{t('proposal.noProposals')}</td></tr>
          ) : (
            proposals.map(p => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>{p.proposer?.name} ({p.proposer?.email})</td>
                <td>{p.venue?.name || '—'}</td>
                <td>{new Date(p.date).toLocaleDateString()}</td>
                <td>{p.capacity}</td>
                <td>{t(`proposal.status.${p.status}`)}</td>
                <td>
                  {p.status === 'pending' && (
                    <>
                      <Button size="sm" variant="success" className="me-2"
                        onClick={() => handleAction(p._id, 'approve')}>
                        {t('proposal.approveButton')}
                      </Button>
                      <Button size="sm" variant="danger"
                        onClick={() => handleAction(p._id, 'reject')}>
                        {t('proposal.rejectButton')}
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ProposalsTab;
