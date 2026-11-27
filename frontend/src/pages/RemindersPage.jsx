import React, { useEffect, useState } from 'react';
import { Bell, CalendarDays, CircleAlert, Syringe } from 'lucide-react';
import api from '../api';
import { useFarm } from '../context/FarmContext';
import { formatDate } from '../components/RecordManager';

export default function RemindersPage() {
  const { selectedFarmId } = useFarm();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!selectedFarmId) { setReminders([]); return; }
    let active = true; setLoading(true); setError('');
    api.get('/reminders', { params: { farmId: selectedFarmId } })
      .then(({ data }) => { if (active) setReminders(data.reminders || []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedFarmId]);
  const overdue = reminders.filter((item) => item.status === 'overdue');
  const upcoming = reminders.filter((item) => item.status !== 'overdue');
  return <section className="page-section">
    <div className="page-heading"><div><span className="eyebrow">STAY AHEAD OF DUE DATES</span><h1>Reminders</h1><p>Upcoming vaccine dates and expected delivery dates from saved records.</p></div><span className="count-chip"><Bell size={15} /> {reminders.length} reminders</span></div>
    <div className="info-strip"><CircleAlert size={17} /><span>Reminders are generated from due dates stored in your records. They are not push notifications or veterinary advice. Check dates with your veterinarian.</span></div>
    {error && <div className="alert error-alert">{error}</div>}
    {loading ? <div className="panel empty-state">Loading reminders…</div> : !selectedFarmId ? <div className="panel empty-state">Select a farm to view reminders.</div> : reminders.length === 0 ? <div className="panel empty-state"><div className="empty-icon"><Bell size={25} /></div><h3>No reminders in the next 45 days</h3><p>When a vaccination next due date or expected delivery date is entered, it will appear here.</p></div> : <div className="reminder-columns">
      <div className="panel reminder-panel"><div className="panel-heading"><div><h3>Overdue vaccinations</h3><p>Past next due dates</p></div><span className="reminder-count overdue-count">{overdue.length}</span></div>{overdue.length ? overdue.map((item) => <ReminderRow key={item.id} item={item} />) : <div className="empty-inline">No overdue vaccine dates.</div>}</div>
      <div className="panel reminder-panel"><div className="panel-heading"><div><h3>Upcoming</h3><p>Within the next 45 days</p></div><span className="reminder-count upcoming-count">{upcoming.length}</span></div>{upcoming.length ? upcoming.map((item) => <ReminderRow key={item.id} item={item} />) : <div className="empty-inline">No upcoming dates.</div>}</div>
    </div>}
  </section>;
}

function ReminderRow({ item }) {
  const Icon = item.type === 'vaccination' ? Syringe : CalendarDays;
  return <div className="reminder-row"><div className={`reminder-icon ${item.type === 'vaccination' ? 'reminder-orange' : 'reminder-green'}`}><Icon size={18} /></div><div className="reminder-info"><strong>{item.title}</strong><span>{item.buffalo}</span></div><div className="reminder-date"><strong>{formatDate(item.date)}</strong><span className={item.status === 'overdue' ? 'text-danger' : ''}>{item.status === 'overdue' ? 'Overdue' : item.type === 'delivery' ? 'Estimated' : 'Upcoming'}</span></div></div>;
}
