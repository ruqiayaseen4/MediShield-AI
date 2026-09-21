import { useState, useCallback } from 'react';
import { Pill, Plus, X, AlertTriangle, ShieldAlert, ShieldCheck, Shield, ShieldQuestion } from 'lucide-react';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { interactionApi, type InteractionCheckResponse, type InteractionResult } from '@/services/api';

const severityConfig: Record<string, { color: 'danger' | 'warning' | 'success' | 'info' | 'default'; icon: typeof ShieldAlert; label: string; bg: string; borderLeft: string }> = {
  severe: { color: 'danger', icon: ShieldAlert, label: 'Severe Interaction', bg: 'border-red-300 bg-red-50', borderLeft: 'border-l-red-500' },
  moderate: { color: 'warning', icon: AlertTriangle, label: 'Moderate Interaction', bg: 'border-amber-300 bg-amber-50', borderLeft: 'border-l-amber-500' },
  mild: { color: 'info', icon: Shield, label: 'Mild Interaction', bg: 'border-blue-300 bg-blue-50', borderLeft: 'border-l-blue-500' },
  none: { color: 'success', icon: ShieldCheck, label: 'No Known Interaction', bg: 'border-green-300 bg-green-50', borderLeft: 'border-l-green-500' },
  unknown: { color: 'default', icon: ShieldQuestion, label: 'Unknown', bg: 'border-slate-300 bg-slate-50', borderLeft: 'border-l-slate-400' },
};

const COMMON_MEDICINES = [
  'Aspirin', 'Warfarin', 'Ibuprofen', 'Metformin', 'Lisinopril', 'Amlodipine',
  'Atorvastatin', 'Omeprazole', 'Metoprolol', 'Losartan', 'Simvastatin', 'Levothyroxine',
  'Prednisone', 'Gabapentin', 'Tramadol', 'Oxycodone', 'Alprazolam', 'Diazepam',
  'Fluoxetine', 'Sertraline', 'Citalopram', 'Acetaminophen', 'Amoxicillin', 'Ciprofloxacin',
  'Codeine', 'Clopidogrel', 'Digoxin', 'Furosemide', 'Hydrochlorothiazide', 'Potassium',
];

export function DrugInteraction() {
  const [medicines, setMedicines] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InteractionCheckResponse | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = inputValue.length >= 1
    ? COMMON_MEDICINES.filter(
        (m) => m.toLowerCase().includes(inputValue.toLowerCase()) && !medicines.includes(m.toLowerCase())
      ).slice(0, 8)
    : [];

  const addMedicine = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed && !medicines.includes(trimmed.toLowerCase())) {
      setMedicines((prev) => [...prev, trimmed.toLowerCase()]);
    }
    setInputValue('');
    setShowSuggestions(false);
  }, [medicines]);

  const removeMedicine = useCallback((index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCheck = async () => {
    if (medicines.length < 2) {
      setError('Please add at least 2 medicines to check interactions.');
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await interactionApi.check(medicines);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check interactions');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addMedicine(inputValue);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Drug Interaction Checker</h1>
        <p className="page-subtitle">
          Enter two or more medicines to check for potential interactions between them.
        </p>
      </div>

      <SafetyDisclaimer />

      {/* Medicine selector */}
      <div className="card p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Select Medicines</h2>

        {/* Selected pills */}
        {medicines.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {medicines.map((m, i) => (
              <span
                key={`${m}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1.5 text-sm font-medium text-teal-800"
              >
                {m}
                <button
                  onClick={() => removeMedicine(i)}
                  className="rounded-full p-0.5 hover:bg-teal-200 transition-colors"
                  aria-label={`Remove ${m}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input with suggestions */}
        <div className="relative mb-4">
          <label htmlFor="medicine-input" className="mb-1.5 block text-sm font-medium text-slate-700">
            Add a medicine
          </label>
          <input
            id="medicine-input"
            type="text"
            className="input-field"
            placeholder="Type a medicine name and press Enter..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
          />

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-teal-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addMedicine(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            className="btn-secondary"
            onClick={() => addMedicine(inputValue)}
            disabled={!inputValue.trim()}
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
          <button
            className="btn-primary flex-1 sm:flex-none"
            onClick={handleCheck}
            disabled={medicines.length < 2 || loading}
          >
            {loading ? <Spinner size="sm" /> : <Pill className="h-4 w-4" />}
            Check Interactions
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {loading && (
        <div className="card p-8 text-center">
          <Spinner />
          <p className="mt-3 text-sm text-slate-500">Checking interactions...</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Overall severity banner */}
          <div className={`rounded-xl border-2 p-4 ${severityConfig[result.overallSeverity]?.bg || severityConfig.unknown.bg}`}>
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = severityConfig[result.overallSeverity]?.icon || ShieldQuestion;
                return <Icon className="h-6 w-6 shrink-0" />;
              })()}
              <div>
                <p className="font-semibold text-slate-900">
                  {severityConfig[result.overallSeverity]?.label || 'Interaction Check Complete'}
                </p>
                <p className="text-sm text-slate-600">
                  {result.totalPairs} pair{result.totalPairs !== 1 ? 's' : ''} checked across {result.medicines.length} medicines
                </p>
              </div>
            </div>
          </div>

          {/* Individual pair results */}
          {result.results.map((r: InteractionResult, idx: number) => (
            <InteractionCard key={`${r.drug1}-${r.drug2}-${idx}`} result={r} />
          ))}

          {/* Disclaimer */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            {result.disclaimer}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !result && (
        <div className="card p-8 text-center">
          <Pill className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-medium text-slate-600">No results yet</h3>
          <p className="mt-1 text-xs text-slate-400">
            Add at least two medicines and click &quot;Check Interactions&quot; to see results.
          </p>
        </div>
      )}
    </div>
  );
}

function InteractionCard({ result }: { result: InteractionResult }) {
  const config = severityConfig[result.severity] || severityConfig.unknown;
  const Icon = config.icon;

  return (
    <div className={`card overflow-hidden border-l-4 ${config.borderLeft} ${config.bg}`}>
      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 shrink-0" />
            <span className="font-semibold text-slate-900 text-sm sm:text-base">
              {result.drug1} + {result.drug2}
            </span>
          </div>
          <Badge variant={config.color}>{result.severity.toUpperCase()}</Badge>
        </div>

        {/* Description */}
        <p className="mb-3 text-sm text-slate-700">{result.description}</p>

        {/* Mechanism */}
        <div className="mb-3">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Mechanism</h4>
          <p className="text-sm text-slate-600">{result.mechanism}</p>
        </div>

        {/* Recommendation */}
        <div className="mb-3">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Recommendation</h4>
          <p className="text-sm font-medium text-slate-800">{result.recommendation}</p>
        </div>

        {/* Source */}
        <p className="text-xs text-slate-400">Source: {result.source}</p>
      </div>
    </div>
  );
}
