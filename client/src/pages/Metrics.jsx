// Metrics.jsx
// Dashboard page that displays key system analytics like bookings, revenue, and venue usage.

import React, { useEffect, useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Accordion, Tabs, Tab, Button, Container } from 'react-bootstrap';
import { apiFetch } from '../utils/api';
import { useTranslation } from 'react-i18next';

const COLORS = ["#623E2A", "#A1866F", "#CBB6A2", "#d9a66b", "#f0c987"];

const Metrics = () => {
  const today = new Date();
  const oneWeekBefore = new Date(today);
  oneWeekBefore.setDate(today.getDate() - 7);
  const oneWeekAfter = new Date(today);
  oneWeekAfter.setDate(today.getDate() + 7);
  const [startDate, setStartDate] = useState(oneWeekBefore.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(oneWeekAfter.toISOString().split('T')[0]);
  const { t } = useTranslation();

  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('current');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());
  const [refreshTimer, setRefreshTimer] = useState(0);
  const [trend, setTrend] = useState({});
  const pageRef = useRef();

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      let url = `/metrics-data?from=${startDate}&to=${endDate}&type=${typeFilter}&status=${statusFilter}`;
      if (selectedVenue) url += `&venue=${encodeURIComponent(selectedVenue)}`;
      const res = await apiFetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t('metrics.error1'));
      setData(json.data);
      setLastRefreshed(Date.now());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, typeFilter, statusFilter, selectedVenue]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    if (!autoRefresh) return;
    const tick = setInterval(() => {
      setRefreshTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [autoRefresh]);

  useEffect(() => {
  if (data) {
    const last = JSON.parse(localStorage.getItem('lastMetrics')) || {};
    const trends = {
      confirmed: getTrend(data.ticketType, 'Confirmed', last.ticketType),
      cancelled: getTrend(data.ticketType, 'Cancelled', last.ticketType),
      revenue: getTrendSimple(data.totalRevenue, last.totalRevenue)
    };
    setTrend(trends);
    localStorage.setItem('lastMetrics', JSON.stringify(data));
  }
}, [data]);

  useEffect(() => {
    document.title = `GIP - ${t('titles.metrics')}`;
  }, [t]);

  const getTrend = (nowList, type, lastList) => {
    const now = nowList?.find(t => t.type === type)?.value || 0;
    const last = lastList?.find(t => t.type === type)?.value || 0;
    if (last === 0) return 0;
    return Math.round(((now - last) / last) * 100);
  };

  const getTrendSimple = (now, last) => {
    if (!last || last === 0) return 0;
    return Math.round(((now - last) / last) * 100);
  };

  const generateInsights = () => {
  const messages = [];

  if (trend.cancelled > 30) {
    messages.push(t('metrics.insight1'));
  }

  if (trend.revenue > 10) {
    messages.push(t('metrics.insight2'));
  }

  if (data?.venueUsage?.length === 1) {
    messages.push(t('metrics.insight3', { venue: data.topVenue }));
  }

  if (data?.ticketsSold < 5) {
    messages.push(t('metrics.insight4'));
  }

  if (trend.revenue < -10) {
  messages.push(t('metrics.insight5'));
}

  const confirmed = data?.ticketType?.find(t => t.type === 'Confirmed')?.value || 0;
  const pending = data?.ticketType?.find(t => t.type === 'Pending')?.value || 0;

  if (confirmed < pending) {
    messages.push(t('metrics.insight6'));
  }

  const cancelled = data?.ticketType?.find(t => t.type === 'Cancelled')?.value || 0;

  if (confirmed > 0 && cancelled / confirmed > 0.5) {
  messages.push(t('metrics.insight7'));
  }

  if (data?.ticketsSold === 0) {
  messages.push(t('metrics.insight8'));
  }

  if (data?.venueUsage?.length > 0) {
    const topCount = data.venueUsage[0]?.bookings || 0;
    const total = data.venueUsage.reduce((sum, v) => sum + v.bookings, 0);
    if (topCount / total > 0.75) {
      messages.push(t('metrics.insight9', { venue: data.topVenue }));
    }
  }

  if (trend.confirmed >= 50) {
  messages.push(t('metrics.insight10'));
  }

  if (trend.revenue === 0 && data?.totalRevenue > 0) {
  messages.push(t('metrics.insight11'));
  }

  return messages;
};

  const exportToCSV = (dataArray, filename) => {
    if (!dataArray || !dataArray.length) return;
    const keys = Object.keys(dataArray[0]);
    const csvContent = [
      keys.join(','),
      ...dataArray.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fade-in" ref={pageRef}>
       <Container className="py-5">
    <div className="d-flex justify-content-start mb-3">
      <Button variant="secondary" onClick={() => navigate(-1)}>
        {t('metrics.backButton')}
      </Button>
    </div>
      <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto' }}>
        <h2 style={{ textAlign: 'center' }}>{t('metrics.title')}</h2>

        {error && <p className="text-danger text-center mt-3">{error}</p>}
        {!data && !error && <p className="text-center mt-4">{t('metrics.loading')}</p>}

        <div className="mb-3" style={{ display: 'flex', justifyContent: 'center' }}>
          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '16px',
            whiteSpace: 'nowrap'
          }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => {
                setAutoRefresh(e.target.checked);
                if (e.target.checked) setLastRefreshed(Date.now());
              }}
            />
            {t('metrics.refreshButton')}
          </label>
        </div>

        {autoRefresh && lastRefreshed && (
        <p className="text-muted text-center mb-3" style={{ fontSize: '14px' }}>
          {t('metrics.lastRefreshed', {
            seconds: Math.floor((Date.now() - lastRefreshed) / 1000)
          })}
        </p>
      )}

        <Accordion defaultActiveKey={null} className="mb-4">
        <Accordion.Item
          eventKey="0"
          style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            backgroundColor: '#f8f9fa',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
            <Accordion.Header>{t('metrics.optionsTitle')}</Accordion.Header>
            <Accordion.Body>

        <Tabs
          defaultActiveKey="filters"
          className="mb-3 justify-content-center custom-tabs"
          fill
          variant="pills"
        >
                <Tab eventKey="filters" title={t('metrics.filterTabTitle')}>
                  <h5 className="text-center mb-3">{t('metrics.timeFilterTitle')}</h5>
                  <div className="text-center mb-3">
                    <label><strong>{t('metrics.timeFilterStart')}</strong></label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      style={filterStyle}
                    />
                    <label style={{ marginLeft: '20px' }}><strong>{t('metrics.timeFilterEnd')}</strong></label>
                    <input
                      type="date"
                      value={endDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={e => {
                        if (new Date(e.target.value) > new Date()) {
                          setError(t('metrics.error2'));
                        } else {
                          setError('');
                          setEndDate(e.target.value);
                        }
                      }}
                      style={filterStyle}
                    />
                  </div>

                  <h5 className="text-center">{t('metrics.bookingFilterTitle')}</h5>
                  <div className="text-center mb-3">
                    <label><strong>{t('metrics.bookingFilterStatus')}</strong></label>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      style={filterStyle}
                    >
                      <option value="current">{t('metrics.bookingFilterCurrent')}</option>
                      <option value="past">{t('metrics.bookingFilterPast')}</option>
                      <option value="all">{t('metrics.bookingFilterAll')}</option>
                    </select>

                    <label style={{ marginLeft: '30px' }}><strong>{t('metrics.typeFilterTitle')}</strong></label>
                    <select
                      value={typeFilter}
                      onChange={e => setTypeFilter(e.target.value)}
                      style={filterStyle}
                    >
                      <option value="all">{t('metrics.typeFilterAll')}</option>
                      <option value="event">{t('metrics.typeFilterEvent')}</option>
                      <option value="venue">{t('metrics.typeFilterVenue')}</option>
                    </select>
                  </div>
                </Tab>

                <Tab eventKey="export" title={t('metrics.exportTabTitle')}>
                  <h5 className="text-center mb-3">{t('metrics.exportFilterTitle')}</h5>
                  {data && (
                    <div className="text-center d-flex flex-wrap justify-content-center gap-3">
                      <Button className="export-button" onClick={() =>
                        exportToCSV([
                          { Metric: 'Tickets Sold', Value: data.ticketsSold },
                          { Metric: 'Total Revenue', Value: data.totalRevenue },
                          { Metric: 'Top Venue', Value: data.topVenue }
                        ], 'metric-summary')}>{t('metrics.exportFilterSummaryButton')}</Button>

                      <Button className="export-button" onClick={() => exportToCSV(data.venueUsage, 'venue-usage')}>{t('metrics.exportFilterVenueButton')}</Button>
                      <Button className="export-button" onClick={() => exportToCSV(data.revenueTrend, 'revenue-trend')}>{t('metrics.exportFilterRevenueButton')}</Button>
                      <Button className="export-button" onClick={() => exportToCSV(data.ticketType, 'ticket-types')}>{t('metrics.exportFilterTicketsButton')}</Button>
                    </div>
                  )}
                </Tab>
              </Tabs>

            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <h4 className="text-center mt-4">{t('metrics.title2')}</h4>
        <div style={grid}>
          <MetricBox title={t('metrics.boxTitle1')} value={data?.venueUsage?.length || 0} />
          <MetricBox title={t('metrics.boxTitle2')} value={data?.topVenue || '—'} />
          <MetricBox
            title={t('metrics.boxTitle3')}
            value={Math.round((data?.ticketsSold || 0) / (data?.venueUsage?.length || 1))}
          />
        </div>

        <h4 className="text-center mt-4">{t('metrics.title3')}</h4>
        <div style={grid}>
          <MetricBox
            title={t('metrics.boxTitle4')}
            trend={trend.confirmed}
            value={data?.ticketType?.find(t => t.type === 'Confirmed')?.value || 0}
          />
          <MetricBox
            title={t('metrics.boxTitle5')}
            value={data?.ticketType?.find(t => t.type === 'Pending')?.value || 0}
          />
          <MetricBox
            title={t('metrics.boxTitle6')}
            value={data?.ticketType?.find(t => t.type === 'Cancelled')?.value || 0}
          />
        </div>

        <h4 className="text-center mt-4">{t('metrics.title4')}</h4>
        <div style={grid}>
          <MetricBox title={t('metrics.boxTitle7')} value={data?.ticketsSold || 0} />
          <MetricBox
            title={t('metrics.boxTitle8')}
            value={`${t('metrics.currency')} ${data?.totalRevenue?.toLocaleString() || '0'}`}
          />
          <MetricBox
            title={t('metrics.boxTitle9')}
            value={`${t('metrics.currency')} ${Math.round((data?.totalRevenue || 0) / (data?.ticketsSold || 1))}`}
          />
        </div>

        <h5 className="text-center mt-4">{t('metrics.title5')}</h5>
        <ul className="text-center">
          {generateInsights().map((msg, i) => <li key={i}>{msg}</li>)}
        </ul>

        <h3 style={sectionHeader}>{t('metrics.title6')}</h3>
        {data?.venueUsage?.length === 0 ? (
          <p className="text-center text-muted">{t('metrics.error3')}</p>
        ) : data?.venueUsage?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.venueUsage}
              onClick={(e) => {
                if (e?.activeLabel) setSelectedVenue(e.activeLabel);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis />
              <XAxis dataKey="name" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="custom-tooltip bg-light p-2 rounded shadow-sm">
                        <strong>{payload[0].name}</strong><br />
                        {t('metrics.bookingsLabel')}: {payload[0].value}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="bookings"
                fill="#623E2A"
                name={t('metrics.bookingsLabel')}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : null}

        <h3 style={sectionHeader}>{t('metrics.title7')}</h3>
        {data?.revenueTrend?.length === 0 ? (
          <p className="text-center text-muted">{t('metrics.error4')}</p>
        ) : data?.revenueTrend?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.revenueTrend}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                label={{
                  value: t('metrics.ROTDate'),
                  position: 'insideBottom',
                  dy: 5,
                }}
                interval={0}
              />
              <YAxis label={{ value: t('metrics.ROTCurrency'), angle: -90, position: 'insideLeft' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="custom-tooltip bg-light p-2 rounded shadow-sm">
                        <strong>{label}</strong><br />
                        {t('metrics.revenueLabel')}: {payload[0].value}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#A1866F" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        ) : null}

        <h3 style={sectionHeader}>{t('metrics.title8')}</h3>
        {data?.ticketType?.length === 0 ? (
          <p className="text-center text-muted">{t('metrics.error5')}</p>
        ) : data?.ticketType?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.ticketType}
                dataKey="value"
                nameKey="type"
                outerRadius={90}
                label={({ type, percent, value }) =>
                  `${t(`metrics.ticketType.${type}`)}: ${(percent * 100).toFixed(1)}% (${value})`
                }
              >
                {(data?.ticketType ?? []).map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const { name, value } = payload[0];
                    return (
                      <div className="custom-tooltip bg-light p-2 rounded shadow-sm">
                        <strong>{t(`metrics.ticketType.${name}`)}</strong>: {value}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                formatter={(value) => t(`metrics.ticketType.${value}`)}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : null}

        {selectedVenue && (
          <div className="text-center mt-3">
            <Button variant="secondary" onClick={() => setSelectedVenue(null)}>
              {t('metrics.clearDrillDownButton')}
            </Button>
          </div>
        )}
      </div>
        </Container>
    </div>
  );
};

const MetricBox = ({ title, value, alert = false, trend }) => (
  <div style={{
    ...boxStyle,
    backgroundColor: alert ? '#f8d7da' : boxStyle.backgroundColor,
    border: alert ? '1px solid #dc3545' : boxStyle.border
  }}>
    <h4>{title}</h4>
    <p style={{ fontSize: '24px', margin: 0 }}>
      {value}
      {trend !== undefined && (
        <span style={{ fontSize: '14px', marginLeft: '6px', color: trend >= 0 ? 'green' : 'red' }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      )}
    </p>
  </div>
);

const boxStyle = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '20px',
  width: '240px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  textAlign: 'center'
};

const sectionHeader = {
  marginTop: '40px',
  textAlign: 'center'
};

const filterStyle = {
  padding: '8px',
  fontSize: '16px',
  marginLeft: '10px',
  width: '180px',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

const grid = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '20px',
  marginBottom: '40px'
};

export default Metrics;
