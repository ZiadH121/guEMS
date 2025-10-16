// ProposalsTab.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../utils/api';

const ProposalsTab = () => {
  const { t } = useTranslation();
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [selectedSldNeeds, setSelectedSldNeeds] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [overflowMap, setOverflowMap] = useState({});

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

  const handleDelete = async (id) => {
    if (!window.confirm(t('proposal.deleteConfirm'))) return;
    try {
      const res = await apiFetch(`/proposals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(t('proposal.deleted'));
      fetchProposals();
    } catch (err) {
      console.error('Delete proposal error:', err);
      alert(t('proposal.deleteError'));
    }
  };

  const detectOverflow = () => {
    const newMap = {};
    document.querySelectorAll('.text-ellipsis').forEach(el => {
      if (el.scrollWidth > el.clientWidth) {
        newMap[el.dataset.key] = true;
      }
    });
    setOverflowMap(newMap);
  };

  useEffect(() => {
    if (!loading && proposals.length > 0) {
      setTimeout(detectOverflow, 100);
      window.addEventListener('resize', detectOverflow);
      return () => window.removeEventListener('resize', detectOverflow);
    }
  }, [loading, proposals]);

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <div>
      <h4 className="text-center mb-3">{t('proposal.reviewTitle')}</h4>
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>{t('proposal.colTitle')}</th>
            <th>{t('proposal.colDescription')}</th>
            <th>{t('proposal.colSldNeeds')}</th>
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
            <tr>
              <td colSpan="9" className="text-center">
                {t('proposal.noProposals')}
              </td>
            </tr>
          ) : (
            proposals.map(p => (
              <tr key={p._id}>
                <td>{p.title}</td>

                <td
                  style={{
                    maxWidth: '180px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    verticalAlign: 'middle'
                  }}
                >
                  {p.description ? (
                    <>
                      <span
                        className="text-ellipsis"
                        data-key={`desc-${p._id}`}
                        title={p.description}
                      >
                        {p.description}
                      </span>
                      {overflowMap[`desc-${p._id}`] && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setModalTitle(t('proposal.fullDescription'));
                            setSelectedDescription(p.description);
                            setSelectedSldNeeds('');
                            setShowModal(true);
                          }}
                          className="ms-1"
                        >
                          {t('proposal.readMore')}
                        </Button>
                      )}
                    </>
                  ) : '—'}
                </td>

                <td
                  style={{
                    maxWidth: '180px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    verticalAlign: 'middle'
                  }}
                >
                  {p.sldNeeds ? (
                    <>
                      <span
                        className="text-ellipsis"
                        data-key={`needs-${p._id}`}
                        title={p.sldNeeds}
                      >
                        {p.sldNeeds}
                      </span>
                      {overflowMap[`needs-${p._id}`] && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setModalTitle(t('proposal.sldNeedsTitle'));
                            setSelectedDescription('');
                            setSelectedSldNeeds(p.sldNeeds);
                            setShowModal(true);
                          }}
                          className="ms-1"
                        >
                          {t('proposal.readMore')}
                        </Button>
                      )}
                    </>
                  ) : '—'}
                </td>

                <td>{p.proposer?.name}</td>
                <td>{p.venue?.name || '—'}</td>
                <td>{new Date(p.date).toLocaleDateString()}</td>
                <td>{p.capacity}</td>
                <td>{t(`proposal.status.${p.status}`)}</td>
                <td>
                  {p.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        className="me-2"
                        onClick={() => handleAction(p._id, 'approve')}
                      >
                        {t('proposal.approveButton')}
                      </Button>
                      <Button
                        size="sm"
                        variant="warning"
                        className="me-2"
                        onClick={() => handleAction(p._id, 'reject')}
                      >
                        {t('proposal.rejectButton')}
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(p._id)}
                  >
                    {t('proposal.deleteButton')}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {selectedDescription && <p>{selectedDescription}</p>}
          {selectedSldNeeds && <p className="text-muted">{selectedSldNeeds}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t('proposal.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProposalsTab;
