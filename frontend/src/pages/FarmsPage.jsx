import React, { useEffect, useState } from 'react';
import { Building2, Check, MailPlus, MapPin, Plus, Users } from 'lucide-react';
import api from '../api';
import { useFarm } from '../context/FarmContext';

export default function FarmsPage() {
  const { farms, selectedFarm, selectedFarmId, selectFarm, refreshFarms } = useFarm();
  const [farmForm, setFarmForm] = useState({ farmName: '', address: '', phone: '' });
  const [memberForm, setMemberForm] = useState({ email: '', role: 'manager' });
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!selectedFarmId) { setMembers([]); return; }
    api.get(`/farms/${selectedFarmId}`).then(({ data }) => setMembers(data.farm.members || [])).catch((err) => setError(err.message));
  }, [selectedFarmId]);

  async function createFarm(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const { data } = await api.post('/farms', farmForm);
      setFarmForm({ farmName: '', address: '', phone: '' });
      await refreshFarms(data.farm._id);
      setNotice('Farm created successfully.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function addMember(event) {
    event.preventDefault(); if (!selectedFarmId) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const { data } = await api.post(`/farms/${selectedFarmId}/members`, memberForm);
      setMembers(data.farm.members || []);
      setMemberForm({ email: '', role: 'manager' });
      setNotice('Farm member added.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function removeMember(userId) {
    if (!window.confirm('Remove this person from the selected farm?')) return;
    try {
      await api.delete(`/farms/${selectedFarmId}/members/${userId}`);
      setMembers((current) => current.filter((member) => member.userId?._id !== userId));
      setNotice('Farm member removed.');
    } catch (err) { setError(err.message); }
  }

  return <section className="page-section">
    <div className="page-heading"><div><span className="eyebrow">MULTI-FARM WORKSPACE</span><h1>My farms</h1><p>Create separate farm spaces and manage access for your team.</p></div><span className="count-chip"><Building2 size={15} /> {farms.length} farm{farms.length === 1 ? '' : 's'}</span></div>
    {notice && <div className="alert success-alert"><Check size={16} />{notice}</div>}{error && <div className="alert error-alert">{error}</div>}
    <div className="farm-layout">
      <div className="farm-list-column"><div className="panel"><div className="panel-heading"><div><h3>Your farms</h3><p>Select a farm to view its data</p></div></div>
        {!farms.length ? <div className="empty-state"><div className="empty-icon"><Building2 size={25} /></div><h3>No farms yet</h3><p>Create a farm to start adding buffaloes and health records.</p></div> : <div className="farm-card-list">{farms.map((farm) => <button className={`farm-card ${String(farm._id) === String(selectedFarmId) ? 'farm-card-selected' : ''}`} key={farm._id} onClick={() => selectFarm(farm._id)}><div className="farm-card-icon"><Building2 size={20} /></div><div><strong>{farm.farmName}</strong><span>{farm.address || 'Address not added'}</span><small>Created {new Date(farm.createdAt).toLocaleDateString('en-IN')}</small></div><span className="farm-selected-indicator">{String(farm._id) === String(selectedFarmId) ? 'Selected' : 'Select'}</span></button>)}</div>}
      </div></div>
      <div className="panel create-farm-panel"><div className="panel-heading"><div><h3>Create another farm</h3><p>One account can manage multiple farms.</p></div><span className="round-heading-icon"><Plus size={17} /></span></div>
        <form className="stacked-form" onSubmit={createFarm}><label>Farm name<input value={farmForm.farmName} onChange={(e) => setFarmForm({ ...farmForm, farmName: e.target.value })} placeholder="Enter farm name" required maxLength="120" /></label><label>Address<input value={farmForm.address} onChange={(e) => setFarmForm({ ...farmForm, address: e.target.value })} placeholder="Village, district, state" /></label><label>Phone<input value={farmForm.phone} onChange={(e) => setFarmForm({ ...farmForm, phone: e.target.value })} placeholder="Contact number" /></label><button className="primary-button full-button" disabled={busy}><Plus size={16} /> Create farm</button></form>
      </div>
    </div>

    {selectedFarm && <div className="panel members-panel"><div className="panel-heading"><div><h3>Farm team · {selectedFarm.farmName}</h3><p>Invite people who already have a BuffaloCare account.</p></div><span className="round-heading-icon"><Users size={17} /></span></div>
      <div className="member-add-row"><form className="member-form" onSubmit={addMember}><label className="member-email-label"><span>Email address</span><input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} placeholder="team.member@example.com" required /></label><label><span>Role</span><select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}><option value="manager">Manager</option><option value="vet">Veterinarian</option></select></label><button className="primary-button" disabled={busy}><MailPlus size={16} /> Add member</button></form></div>
      <div className="members-list">{members.map((member) => <div className="member-row" key={member.userId?._id}><div className="avatar">{member.userId?.name?.slice(0, 1)?.toUpperCase() || 'U'}</div><div className="member-info"><strong>{member.userId?.name || 'Farm member'}</strong><span>{member.userId?.email || ''}</span></div><span className="role-pill">{member.role}</span>{member.role !== 'owner' && <button className="text-danger-button" onClick={() => removeMember(member.userId._id)}>Remove</button>}</div>)}</div>
      <p className="permissions-note">Owners can manage farm settings and team access. Managers can maintain animal records. Veterinarians can add pregnancy, vaccination and medical information. The API checks access on every farm request.</p>
    </div>}
  </section>;
}
