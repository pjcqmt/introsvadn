export const DaltonismSymbol = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5L19 19" stroke="#e53935" strokeWidth="2"/>
    <path d="M19 5L5 19" stroke="#43a047" strokeWidth="2"/>
  </svg>
);

export const CholesterolSymbol = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="12" y1="4" x2="12" y2="20" stroke="#FFD600" strokeWidth="3"/>
  </svg>
);

export const CataractSymbol = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Eye background */}
    <ellipse cx="12" cy="12" rx="10" ry="6" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="1"/>
    {/* Blue horizontal line */}
    <line x1="4" y1="12" x2="20" y2="12" stroke="#1976D2" strokeWidth="2.5"/>
  </svg>
);

export interface MedicalCondition {
  id: string;
  name: string;
  symbol: React.FC;
  color: string;
}

export const medicalConditions: MedicalCondition[] = [
  {
    id: 'daltonism',
    name: 'Daltonisme rouge/vert',
    symbol: DaltonismSymbol,
    color: '#e53935',
  },
  {
    id: 'cholesterol',
    name: 'Hypercholestérolémie',
    symbol: CholesterolSymbol,
    color: '#FFD600',
  },
  {
    id: 'cataract',
    name: 'Cataracte',
    symbol: CataractSymbol,
    color: '#1976D2',
  },
]; 