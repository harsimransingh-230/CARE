import React from 'react';
import { Syringe } from 'lucide-react';
import RecordManager, { formatDate } from '../components/RecordManager';
import useBuffaloOptions from '../useBuffaloOptions';

export default function VaccinationsPage() {
  const buffaloOptions = useBuffaloOptions();
  const fields = [
    { name: 'buffaloId', label: 'Buffalo', type: 'select', options: buffaloOptions, required: true, placeholder: 'Choose a buffalo' },
    { name: 'vaccineName', label: 'Vaccine name', required: true, placeholder: 'Enter the vaccine name', maxLength: 120 },
    { name: 'vaccinationDate', label: 'Vaccination date', type: 'date', required: true },
    { name: 'nextDueDate', label: 'Next due date', type: 'date', help: 'Leave blank when no next dose has been prescribed.' },
    { name: 'batchNumber', label: 'Batch number', placeholder: 'Vaccine batch / lot', maxLength: 100 },
    { name: 'veterinarian', label: 'Veterinarian', placeholder: 'Name of administering veterinarian', maxLength: 120 },
    { name: 'notes', label: 'Notes', type: 'textarea', wide: true, placeholder: 'Dose, route, reaction or other details' }
  ];
  const columns = [
    { key: 'buffaloId.name', label: 'Buffalo', render: (row) => <><strong>{row.buffaloId?.name || 'Deleted buffalo'}</strong><small className="table-subtext">{row.buffaloId?.tagNumber || ''}</small></> },
    { key: 'vaccineName', label: 'Vaccine' },
    { key: 'vaccinationDate', label: 'Given on', render: (row) => formatDate(row.vaccinationDate) },
    { key: 'nextDueDate', label: 'Next due', render: (row) => formatDate(row.nextDueDate) },
    { key: 'veterinarian', label: 'Veterinarian' }
  ];
  return <>
    <div className="section-intro"><div className="section-icon icon-orange"><Syringe size={21} /></div><div><span className="eyebrow">PREVENTIVE HEALTH</span><h1>Vaccination records</h1><p>Store administered vaccine details, batch numbers and veterinarian notes.</p></div></div>
    <div className="info-strip warning-strip"><Syringe size={17} /><span>BuffaloCare stores the schedule entered by your farm team or veterinarian. It does not prescribe vaccines or automatically decide which vaccine is safe during pregnancy. Confirm the vaccine, timing and dose with a qualified veterinarian.</span></div>
    <RecordManager title="Vaccination history" subtitle="Vaccines actually administered and their next due dates." endpoint="/vaccinations" resourceKey="vaccinations" fields={fields} columns={columns} searchKeys={['buffaloId.name', 'buffaloId.tagNumber', 'vaccineName', 'batchNumber']} emptyTitle="No vaccination records" emptyText="Save a vaccination after it has been administered. No vaccine history has been added yet." addLabel="Add vaccination" searchPlaceholder="Search buffalo or vaccine…" />
  </>;
}
