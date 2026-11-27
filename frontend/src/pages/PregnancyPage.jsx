import React from 'react';
import { CalendarDays } from 'lucide-react';
import RecordManager, { formatDate } from '../components/RecordManager';
import useBuffaloOptions from '../useBuffaloOptions';

const statusOptions = [
  { value: 'pending_confirmation', label: 'Pending confirmation' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'not_pregnant', label: 'Not pregnant' }
];

export default function PregnancyPage() {
  const buffaloOptions = useBuffaloOptions('female');
  const fields = [
    { name: 'buffaloId', label: 'Buffalo', type: 'select', options: buffaloOptions, required: true, placeholder: 'Choose an active buffalo' },
    { name: 'inseminationDate', label: 'Mating / AI date', type: 'date', required: true },
    { name: 'gestationDays', label: 'Gestation estimate (days)', type: 'number', defaultValue: 310, min: 250, max: 380, required: true, help: 'Default is an estimate only. Confirm the appropriate period with your veterinarian.' },
    { name: 'confirmationDate', label: 'Pregnancy confirmation date', type: 'date' },
    { name: 'status', label: 'Pregnancy status', type: 'select', defaultValue: 'pending_confirmation', options: statusOptions, required: true },
    { name: 'actualDeliveryDate', label: 'Actual delivery date', type: 'date' },
    { name: 'notes', label: 'Notes', type: 'textarea', wide: true, placeholder: 'Pregnancy checks, observations or veterinary advice' }
  ];
  const columns = [
    { key: 'buffaloId.name', label: 'Buffalo', render: (row) => <><strong>{row.buffaloId?.name || 'Deleted buffalo'}</strong><small className="table-subtext">{row.buffaloId?.tagNumber || ''}</small></> },
    { key: 'inseminationDate', label: 'Mating / AI date', render: (row) => formatDate(row.inseminationDate) },
    { key: 'expectedDeliveryDate', label: 'Estimated delivery', render: (row) => formatDate(row.expectedDeliveryDate) },
    { key: 'confirmationDate', label: 'Confirmed on', render: (row) => formatDate(row.confirmationDate) },
    { key: 'status', label: 'Status', render: (row) => <span className={`status-pill ${row.status === 'confirmed' ? 'status-green' : row.status === 'delivered' ? 'status-blue' : row.status === 'not_pregnant' ? 'status-gray' : 'status-orange'}`}>{statusOptions.find((item) => item.value === row.status)?.label || row.status}</span> }
  ];
  return <>
    <div className="section-intro"><div className="section-icon icon-purple"><CalendarDays size={21} /></div><div><span className="eyebrow">REPRODUCTIVE HEALTH</span><h1>Pregnancy tracker</h1><p>Record mating or AI dates, confirmation and delivery outcomes.</p></div></div>
    <div className="info-strip"><CalendarDays size={17} /><span>Expected delivery dates are estimates calculated from the mating / AI date and the gestation days entered. They are not a diagnosis. Ask a veterinarian to confirm pregnancy and advise on care.</span></div>
    <RecordManager title="Pregnancy records" subtitle="Pregnancy history for the selected farm." endpoint="/pregnancies" resourceKey="pregnancies" fields={fields} columns={columns} searchKeys={['buffaloId.name', 'buffaloId.tagNumber', 'status']} emptyTitle="No pregnancy records" emptyText="Add a pregnancy record after mating or artificial insemination. The due date will be calculated and stored by the API." addLabel="Add pregnancy record" searchPlaceholder="Search buffalo or status…" />
  </>;
}
