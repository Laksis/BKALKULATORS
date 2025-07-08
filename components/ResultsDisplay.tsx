
import React from 'react';
import { Results } from '../types';
import Card from './ui/Card';

interface ResultsDisplayProps {
  results: Results | null;
}

const ResultRow: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = '' }) => (
  <div className={`flex justify-between items-baseline py-3 border-b border-slate-200 ${className}`}>
    <span className="text-slate-600">{label}</span>
    <span className="font-semibold text-slate-800">{value}</span>
  </div>
);

const formatCurrency = (value: number) => `€${value.toFixed(2)}`;

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  
  const getUnitLabel = (unit: 'm2' | 'pcs') => {
    return unit === 'm2' ? 'm²' : 'gab.';
  }

  const getTotalUnitsLabel = (unit: 'm2' | 'pcs') => {
    return unit === 'm2' ? 'Kopējā platība (ar piezāģēm)' : 'Kopējais daudzums';
  }

  return (
    <Card className="sticky top-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Izmaksu Rezultāts</h2>
      {results ? (
        <div className="space-y-2">
          <ResultRow label={getTotalUnitsLabel(results.unit)} value={`${results.totalUnits.toFixed(2)} ${getUnitLabel(results.unit)}`} />
          <ResultRow label="Nepieciešamās paletes" value={`${results.palettesNeeded} gab.`} />
          <ResultRow label="Kopējais svars" value={`${results.totalWeightTons.toFixed(2)} t`} />
          <ResultRow label="Materiālu izmaksas" value={formatCurrency(results.pavingCost)} />
          <ResultRow label="Piegādes izmaksas" value={formatCurrency(results.deliveryCost)} />
          
          <div className="pt-4">
            <h3 className="font-semibold text-slate-700 mb-2">Palešu atgriešana:</h3>
            <ResultRow label="Palešu depozīts (kopā)" value={formatCurrency(results.paletteDepositTotal)} />
            {results.returnTransportCost > 0 && (
                 <ResultRow label="Atgriešanas transports" value={formatCurrency(results.returnTransportCost)} />
            )}
            {results.paletteRefund > 0 && (
                <ResultRow label="Atgrieztā summa par paletēm" value={formatCurrency(results.paletteRefund)} />
            )}
             <ResultRow label="Palešu neto izmaksas/ieguvums" value={formatCurrency(results.paletteReturnNet > 0 ? results.paletteReturnNet : -results.paletteReturnNet)} className="text-base" />
          </div>

          <div className="pt-6">
            <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg">
                <span className="text-xl font-bold text-indigo-900">KOPĀ:</span>
                <span className="text-2xl font-bold text-indigo-900">{formatCurrency(results.totalCost)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">Aprēķins vēl nav veikts</h3>
          <p className="mt-1 text-sm text-slate-500">Aizpildiet formu un nospiediet "Aprēķināt".</p>
        </div>
      )}
    </Card>
  );
};

export default ResultsDisplay;
