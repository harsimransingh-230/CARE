import React from 'react';
import { PawPrint } from 'lucide-react';
import RecordManager, { formatDate } from '../components/RecordManager';

const fields = [
  { name: 'tagNumber', label: 'Identification / tag number', required: true, placeholder: 'e.g. B-001', maxLength: 50 },
  { name: 'name', label: 'Buffalo name', required: true, placeholder: 'Animal name', maxLength: 80 },
  { name: 'breed', label: 'Breed', placeholder: 'e.g. Murrah', maxLength: 80 },
  { name: 'sex', label: 'Sex', type: 'select', required: true, defaultValue: 'female', options: [{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }] },
  { name: 'dateOfBirth', label: 'Date of birth', type: 'date' },
  { name: 'notes', label: 'Notes', type: 'textarea', wide: true, placeholder: 'Identification marks, origin or other details' }
];
const columns = [
  { key: 'tagNumber', label: 'Tag ID' },
  { key: 'name', label: 'Name' },
  { key: 'breed', label: 'Breed' },
  { key: 'sex', label: 'Sex', render: (row) => row.sex ? row.sex[0].toUpperCase() + row.sex.slice(1) : '—' },
  { key: 'dateOfBirth', label: 'Date of birth', render: (row) => formatDate(row.dateOfBirth) },
  { key: 'isActive', label: 'Record status', render: (row) => <span className={`status-pill ${row.isActive ? 'status-green' : 'status-gray'}`}>{row.isActive ? 'Active' : 'Archived'}</span> }
];

export default function BuffaloesPage() {
  return <>
    <div className="section-intro"><div className="section-icon icon-green"><PawPrint size={21} /></div><div><span className="eyebrow">ANIMAL DIRECTORY</span><h1>Buffaloes</h1><p>Register animals and keep their identification details in one place.</p></div></div>
    <RecordManager title="Buffalo directory" subtitle="Only buffalo records stored in your selected farm are shown." endpoint="/buffaloes" resourceKey="buffaloes" fields={fields} columns={columns} searchKeys={['name', 'tagNumber', 'breed']} emptyTitle="No buffaloes registered" emptyText="Add the first buffalo to this farm. Records will be saved to your database." addLabel="Add buffalo" searchPlaceholder="Search by name, tag or breed…" />
  </>;
}
