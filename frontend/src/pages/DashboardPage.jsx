import React, { useEffect, useState } from 'react';
import { ArrowRight, Bell, CalendarCheck, CalendarDays, CheckCircle2, CircleAlert, ClipboardList, PawPrint, Syringe, Activity, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { formatDate } from '../components/RecordManager';

function MetricCard({ icon: Icon, label, value, tone, detail, to }) {
  return <Link to={to} className={`metric-card ${tone}`}><div className="metric-top"><div className="metric-icon"><Icon size={22} /></div><ArrowRight size={17} /></div><strong>{value}</strong><span>{label}</span><small>{detail}</small></Link>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedFarm, selectedFarmId } = useFarm();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedFarmId) { setData(null); return; }
    let active = true;
    setLoading(true);
    api.get('/dashboard', { params: { farmId: selectedFarmId } })
      .then(({ data: result }) => { if (active) setData(result); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedFarmId]);

  const summary = data?.summary || {};
  const breakdown = data?.vaccinationBreakdown || { upToDate: 0, dueSoon: 0, overdue: 0 };
  const totalVaccinationStatuses = breakdown.upToDate + breakdown.dueSoon + breakdown.overdue;
  const vaccinationPercent = totalVaccinationStatuses ? Math.round((breakdown.upToDate / totalVaccinationStatuses) * 100) : 0;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return <section className="page-section dashboard-page">
    <div className="welcome-banner"><div><span className="eyebrow">YOUR FARM AT A GLANCE</span><h1>{greeting}, {user?.name?.split(' ')[0] || 'there'}!</h1><p>{selectedFarm ? `Here's the latest record summary for ${selectedFarm.farmName}.` : 'Create your first farm to start managing animal records.'}</p><div className="banner-actions"><Link to="/farms" className="banner-button">Manage farms <ArrowRight size={16} /></Link><Link to="/buffaloes" className="banner-link">View buffaloes</Link></div></div><div className="banner-illustration"><div className="sun-orb" /><div className="field-line field-line-one" /><div className="field-line field-line-two" /><PawPrint size={84} strokeWidth={1.3} /></div></div>

    {!selectedFarmId ? <div className="panel empty-dashboard"><div className="empty-icon"><PawPrint size={27} /></div><h2>No farm selected</h2><p>Create a farm to start storing real buffalo, pregnancy and vaccination information.</p><Link to="/farms" className="primary-button"><Plus size={17} /> Create your first farm</Link></div> : <>
      {error && <div className="alert error-alert"><CircleAlert size={16} />{error}</div>}
      <div className="metric-grid">
        <MetricCard icon={PawPrint} label="Total buffaloes" value={loading ? '—' : summary.totalBuffaloes ?? 0} tone="blue" detail={`${summary.activeBuffaloes ?? 0} active records`} to="/buffaloes" />
        <MetricCard icon={Activity} label="Confirmed pregnant" value={loading ? '—' : summary.pregnantBuffaloes ?? 0} tone="green" detail="Based on saved pregnancy records" to="/pregnancy" />
        <MetricCard icon={Syringe} label="Vaccines due soon" value={loading ? '—' : summary.vaccinationsDueSoon ?? 0} tone="orange" detail={`${summary.vaccinationsOverdue ?? 0} overdue records`} to="/vaccinations" />
        <MetricCard icon={CalendarCheck} label="Deliveries in 30 days" value={loading ? '—' : summary.expectedDeliveries ?? 0} tone="purple" detail="From active pregnancy records" to="/pregnancy" />
      </div>

      <div className="dashboard-middle">
        <div className="panel overview-panel"><div className="panel-heading"><div><h3>Vaccination overview</h3><p>Based on records with a next due date</p></div><Link to="/vaccinations">View records <ArrowRight size={15} /></Link></div>
          <div className="vaccination-overview"><div className="donut-wrap"><div className="donut-chart" style={{ '--progress': `${vaccinationPercent}%` }}><div><strong>{vaccinationPercent}%</strong><span>Up to date</span></div></div></div><div className="chart-legend"><div><i className="legend-dot green-dot" /><span>Up to date</span><strong>{breakdown.upToDate}</strong></div><div><i className="legend-dot orange-dot" /><span>Due soon</span><strong>{breakdown.dueSoon}</strong></div><div><i className="legend-dot red-dot" /><span>Overdue</span><strong>{breakdown.overdue}</strong></div></div></div>
          <p className="chart-note">Only saved vaccination records with a due date are included. Vaccine timing should be entered or confirmed by a veterinarian.</p>
        </div>
        <div className="panel quick-panel"><div className="panel-heading"><div><h3>Quick actions</h3><p>Add information to the selected farm</p></div></div><div className="quick-actions"><Link to="/buffaloes"><span className="quick-icon green-quick"><PawPrint size={18} /></span><span><strong>Add buffalo</strong><small>Register an animal</small></span><ArrowRight size={16} /></Link><Link to="/pregnancy"><span className="quick-icon purple-quick"><CalendarDays size={18} /></span><span><strong>Record pregnancy</strong><small>Track expected delivery</small></span><ArrowRight size={16} /></Link><Link to="/vaccinations"><span className="quick-icon orange-quick"><Syringe size={18} /></span><span><strong>Add vaccination</strong><small>Save a vaccine record</small></span><ArrowRight size={16} /></Link><Link to="/medical"><span className="quick-icon blue-quick"><ClipboardList size={18} /></span><span><strong>Add medical record</strong><small>Save a vet visit</small></span><ArrowRight size={16} /></Link></div></div>
      </div>

      <div className="dashboard-bottom">
        <div className="panel bottom-panel"><div className="panel-heading"><div><h3>Recently added buffaloes</h3><p>Latest records saved for this farm</p></div><Link to="/buffaloes">View all <ArrowRight size={15} /></Link></div>
          {loading ? <div className="empty-inline">Loading…</div> : !data?.recentBuffaloes?.length ? <div className="empty-inline">No buffalo records yet. Add your first buffalo to get started.</div> : <div className="compact-list">{data.recentBuffaloes.map((buffalo) => <div className="compact-row" key={buffalo._id}><div className="animal-avatar"><PawPrint size={17} /></div><div className="compact-main"><strong>{buffalo.name}</strong><span>{buffalo.tagNumber} {buffalo.breed ? `· ${buffalo.breed}` : ''}</span></div><span className={`status-pill ${buffalo.isActive ? 'status-green' : 'status-gray'}`}>{buffalo.isActive ? 'Active' : 'Archived'}</span></div>)}</div>}
        </div>
        <div className="panel bottom-panel"><div className="panel-heading"><div><h3>Recent activity</h3><p>Latest vaccination and medical updates</p></div><Link to="/medical">View records <ArrowRight size={15} /></Link></div>
          {!data?.activities?.length ? <div className="empty-inline">No activity yet. New vaccination and medical records will appear here.</div> : <div className="activity-list">{data.activities.map((item) => <div className="activity-row" key={item.id}><span className={`activity-dot ${item.type === 'vaccination' ? 'activity-orange' : 'activity-blue'}`} /><div><strong>{item.title}</strong><span>{item.subject}</span></div><time>{formatDate(item.date)}</time></div>)}</div>}
        </div>
      </div>
    </>}
  </section>;
}
