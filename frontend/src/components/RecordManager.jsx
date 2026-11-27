import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, Check, Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import api from '../api';
import { useFarm } from '../context/FarmContext';

function dateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function RecordManager({
  title, subtitle, endpoint, resourceKey, fields, columns, searchKeys = [], emptyTitle, emptyText,
  addLabel = 'Add record', allowDelete = true, searchPlaceholder = 'Search records…'
}) {
  const { selectedFarmId } = useFarm();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  async function loadRows() {
    if (!selectedFarmId) { setRows([]); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(endpoint, { params: { farmId: selectedFarmId } });
      setRows(data[resourceKey] || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRows(); }, [selectedFarmId, endpoint]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => searchKeys.some((key) => String(key.split('.').reduce((value, part) => value?.[part], row) ?? '').toLowerCase().includes(query)));
  }, [rows, search, searchKeys]);

  function openCreate() {
    setEditing(null);
    const initial = {};
    fields.forEach((field) => { initial[field.name] = field.defaultValue ?? ''; });
    setForm(initial);
    setError('');
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    const initial = {};
    fields.forEach((field) => {
      let value = field.name.split('.').reduce((current, key) => current?.[key], row);
      if (field.name === 'buffaloId' && value && typeof value === 'object') value = value._id;
      if (field.type === 'date') value = dateInputValue(value);
      initial[field.name] = value ?? '';
    });
    setForm(initial);
    setError('');
    setModalOpen(true);
  }

  function changeField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!selectedFarmId) return;
    setSaving(true);
    setError('');
    const payload = { farmId: selectedFarmId, ...form };
    fields.forEach((field) => {
      if (field.type === 'date' && payload[field.name] === '') payload[field.name] = null;
      if (field.type === 'number' && payload[field.name] !== '') payload[field.name] = Number(payload[field.name]);
    });
    try {
      if (editing) await api.patch(`${endpoint}/${editing._id}`, payload);
      else await api.post(endpoint, payload);
      setModalOpen(false);
      setNotice(editing ? 'Record updated successfully.' : 'Record saved successfully.');
      await loadRows();
      window.setTimeout(() => setNotice(''), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeRow(row) {
    const label = row.name || row.tagNumber || row.vaccineName || row.diagnosis || 'this record';
    if (!window.confirm(`Delete/archive ${label}? This action cannot be undone from this screen.`)) return;
    try {
      await api.delete(`${endpoint}/${row._id}`);
      setNotice('Record removed.');
      await loadRows();
      window.setTimeout(() => setNotice(''), 3500);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div><span className="eyebrow">FARM RECORDS</span><h1>{title}</h1><p>{subtitle}</p></div>
        <button className="primary-button" onClick={openCreate} disabled={!selectedFarmId}><Plus size={17} /> {addLabel}</button>
      </div>

      {notice && <div className="alert success-alert"><Check size={16} />{notice}</div>}
      {error && !modalOpen && <div className="alert error-alert"><AlertCircle size={16} />{error}<button className="alert-close" onClick={() => setError('')}><X size={15} /></button></div>}

      <div className="panel table-panel">
        <div className="panel-toolbar"><div><h3>{title}</h3><span>{rows.length} record{rows.length === 1 ? '' : 's'} saved in this farm</span></div><label className="table-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder} /></label></div>
        {!selectedFarmId ? <div className="empty-state"><div className="empty-icon"><CalendarDays size={25} /></div><h3>Create or select a farm</h3><p>Choose a farm from the top bar to view its records.</p></div> : loading ? <div className="empty-state">Loading records…</div> : visibleRows.length === 0 ? <div className="empty-state"><div className="empty-icon"><CalendarDays size={25} /></div><h3>{rows.length ? 'No matching records' : emptyTitle}</h3><p>{rows.length ? 'Try another search term.' : emptyText}</p>{rows.length === 0 && <button className="secondary-button" onClick={openCreate}><Plus size={16} /> {addLabel}</button>}</div> : (
          <div className="table-scroll"><table><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}<th className="action-head">Actions</th></tr></thead><tbody>
            {visibleRows.map((row) => <tr key={row._id}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : column.key.split('.').reduce((value, part) => value?.[part], row) || '—'}</td>)}<td><div className="row-actions"><button className="table-icon-button" onClick={() => openEdit(row)} title="Edit record"><Edit3 size={15} /></button>{allowDelete && <button className="table-icon-button danger-icon" onClick={() => removeRow(row)} title="Delete or archive"><Trash2 size={15} /></button>}</div></td></tr>)}
          </tbody></table></div>
        )}
      </div>

      {modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
        <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="record-modal-title">
          <div className="modal-heading"><div><span className="eyebrow">{editing ? 'UPDATE INFORMATION' : 'NEW FARM RECORD'}</span><h2 id="record-modal-title">{editing ? 'Edit ' + title.toLowerCase() : addLabel}</h2></div><button className="icon-button" onClick={() => setModalOpen(false)}><X size={20} /></button></div>
          <form className="record-form" onSubmit={submit}>
            <div className="form-grid">
              {fields.map((field) => <label key={field.name} className={field.wide ? 'field-wide' : ''}>{field.label}{field.required && <span className="required-mark"> *</span>}
                {field.help && <small className="field-help">{field.help}</small>}
                {field.type === 'select' ? <select name={field.name} value={form[field.name] ?? ''} onChange={changeField} required={field.required}><option value="">{field.placeholder || 'Select an option'}</option>{(field.options || []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                  : field.type === 'textarea' ? <textarea name={field.name} value={form[field.name] ?? ''} onChange={changeField} placeholder={field.placeholder || ''} rows={3} maxLength={field.maxLength || 2000} required={field.required} />
                  : <input name={field.name} type={field.type || 'text'} value={form[field.name] ?? ''} onChange={changeField} placeholder={field.placeholder || ''} required={field.required} min={field.min} max={field.max} maxLength={field.maxLength} />}
              </label>)}
            </div>
            {error && <div className="alert error-alert"><AlertCircle size={16} />{error}</div>}
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Save record'}</button></div>
          </form>
        </div>
      </div>}
    </section>
  );
}
