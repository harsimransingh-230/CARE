import React from 'react';
import { Stethoscope } from 'lucide-react';
import RecordManager, { formatDate } from '../components/RecordManager';
import useBuffaloOptions from '../useBuffaloOptions';

export default function MedicalPage() {
  const buffaloOptions = useBuffaloOptions();
  const fields = [
    { name: 'buffaloId', label: 'Buffalo', type: 'select', options: buffaloOptions, required: true, placeholder: 'Choose a buffalo' },
    { name: 'visitDate', label: 'Visit date', type: 'date', required: true },
    { name: 'diagnosis', label: 'Diagnosis / reason for visit', required: true, placeholder: 'Enter veterinarian diagnosis', maxLength: 500 },
    { name: 'veterinarian', label: 'Veterinarian', placeholder: 'Veterinarian name', maxLength: 120 },
    { name: 'followUpDate', label: 'Follow-up date', type: 'date' },
    { name: 'treatment', label: 'Treatment', type: 'textarea', wide: true, placeholder: 'Treatment or medicines as prescribed' },
    { name: 'notes', label: 'Additional notes', type: 'textarea', wide: true, placeholder: 'Observations and follow-up instructions' }
  ];
  const columns = [
    { key: 'buffaloId.name', label: 'Buffalo', render: (row) => <><strong>{row.buffaloId?.name || 'Deleted buffalo'}</strong><small className="table-subtext">{row.buffaloId?.tagNumber || ''}</small></> },
    { key: 'visitDate', label: 'Visit date', render: (row) => formatDate(row.visitDate) },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'treatment', label: 'Treatment', render: (row) => row.treatment || '—' },
    { key: 'veterinarian', label: 'Veterinarian' },
    { key: 'followUpDate', label: 'Follow-up', render: (row) => formatDate(row.followUpDate) }
  ];
  return <>
    <div className="section-intro"><div className="section-icon icon-blue"><Stethoscope size={21} /></div><div><span className="eyebrow">ANIMAL HEALTH HISTORY</span><h1>Medical records</h1><p>Maintain a dated history of veterinary visits, diagnosis and treatment.</p></div></div>
    <div className="info-strip"><Stethoscope size={17} /><span>Use this section to document advice and treatment from your veterinarian. BuffaloCare is a record-keeping tool, not a veterinary diagnosis service.</span></div>
    <RecordManager title="Medical history" subtitle="Veterinary and treatment records for the selected farm." endpoint="/medical-records" resourceKey="records" fields={fields} columns={columns} searchKeys={['buffaloId.name', 'buffaloId.tagNumber', 'diagnosis', 'treatment', 'veterinarian']} emptyTitle="No medical records" emptyText="No veterinary visits have been recorded for this farm yet." addLabel="Add medical record" searchPlaceholder="Search diagnosis or buffalo…" />
  </>;
}
