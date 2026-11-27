import { useEffect, useState } from 'react';
import api from './api';
import { useFarm } from './context/FarmContext';

export default function useBuffaloOptions(requiredSex = 'all') {
  const { selectedFarmId } = useFarm();
  const [options, setOptions] = useState([]);
  useEffect(() => {
    if (!selectedFarmId) { setOptions([]); return; }
    let active = true;
    api.get('/buffaloes', { params: { farmId: selectedFarmId, status: 'active' } })
      .then(({ data }) => { if (active) setOptions((data.buffaloes || []).filter((item) => requiredSex === 'all' || item.sex === requiredSex).map((item) => ({ value: item._id, label: `${item.name} · ${item.tagNumber}` }))); })
      .catch(() => { if (active) setOptions([]); });
    return () => { active = false; };
  }, [selectedFarmId, requiredSex]);
  return options;
}
