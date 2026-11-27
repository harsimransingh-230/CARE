import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity, Bell, ChevronDown, ClipboardList, Home, Menu, PawPrint, Syringe,
  CalendarDays, Building2, Settings, LogOut, Stethoscope, X, Search, Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/farms', label: 'My Farms', icon: Building2 },
  { to: '/buffaloes', label: 'Buffaloes', icon: PawPrint },
  { to: '/pregnancy', label: 'Pregnancy Tracker', icon: CalendarDays },
  { to: '/vaccinations', label: 'Vaccination Records', icon: Syringe },
  { to: '/medical', label: 'Medical Records', icon: Stethoscope },
  { to: '/reminders', label: 'Reminders', icon: Bell }
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { farms, selectedFarm, selectedFarmId, selectFarm, loadingFarms } = useFarm();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><div className="logo-icon"><PawPrint size={25} /></div><div><strong>Buffalo<span>Care</span></strong><small>Healthy herd. Happy farmer.</small></div><button className="sidebar-close icon-button" onClick={() => setSidebarOpen(false)}><X size={19} /></button></div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="main-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span></NavLink>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="farm-tip"><Leaf size={18} /><div><strong>Good records, better care</strong><span>Keep every animal's history up to date.</span></div></div>
          <button className="logout-link" onClick={handleLogout}><LogOut size={17} /> Sign out</button>
          <div className="sidebar-user"><div className="avatar">{user?.name?.slice(0, 1)?.toUpperCase() || 'U'}</div><div className="user-meta"><strong>{user?.name}</strong><span>{user?.platformRole === 'superadmin' ? 'Platform admin' : 'BuffaloCare member'}</span></div></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={22} /></button>
          <div className="topbar-search"><Search size={17} /><span>BuffaloCare farm management</span></div>
          <div className="topbar-right">
            <div className="farm-select-wrap"><Building2 size={16} /><select value={selectedFarmId} onChange={(event) => selectFarm(event.target.value)} disabled={!farms.length || loadingFarms} aria-label="Select farm">{!farms.length && <option value="">No farms yet</option>}{farms.map((farm) => <option key={farm._id} value={farm._id}>{farm.farmName}</option>)}</select><ChevronDown size={15} /></div>
            <div className="top-user"><div className="avatar small-avatar">{user?.name?.slice(0, 1)?.toUpperCase() || 'U'}</div><div><strong>{user?.name}</strong><span>{selectedFarm ? selectedFarm.farmName : 'Select a farm'}</span></div></div>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}
