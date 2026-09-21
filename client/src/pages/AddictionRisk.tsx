import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, ShieldAlert, Shield, ShieldQuestion, Info, Stethoscope } from 'lucide-react';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { addictionApi, type AddictionRiskResponse } from '@/services/api';

const riskConfig: Record<string, { color: 'danger' | 'warning' | 'success' | 'default'; icon: typeof ShieldAlert; label: string; barColor: string; barWidth: string }> = {
  high: { color: 'danger', icon: ShieldAlert, label: 'High Risk', barColor: 'bg-red-500', barWidth: 'w-full' },
  moderate: { color: 'warning', icon: AlertTriangle, label: 'Moderate Risk', barColor: 'bg-amber-500', barWidth: 'w-2/3' },
  low: { color: 'success', icon: Shield, label: 'Low Risk', barColor: 'bg-green-500', barWidth: 'w-1/3' },
  unknown: { color: 'default', icon: ShieldQuestion, label: 'Unknown', barColor: 'bg-slate-400', barWidth: 'w-0' },
};

const QUICK_SEARCHES = [
  { name: 'Oxycodone', level: 'high' },
  { name: 'Alprazolam (Xanax)', level: 'high' },
  { name: 'Diazepam (Valium)', level: 'moderate' },
  { name: 'Tramadol', level: 'moderate' },
  { name: 'Methylphenidate (Ritalin)', level: 'moderate' },
  { name: 'Gabapentin', level: 'low' },
];

export function AddictionRisk() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AddictionRiskResponse | null>(null);

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) {
      setError('Please enter a medicine name.');
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await addictionApi.getRisk(q);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check addiction risk');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Addiction / Dependency Risk</h1>
        <p className="page-subtitle">
          Look up known dependency and addiction risk profiles for medicines.
        </p>
      </div>

      <SafetyDisclaimer />

      {/* Search */}
      <div className="card p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Search Medicine</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="medicine" className="mb-1.5 block text-sm font-medium text-slate-700">
              Medicine name
            </label>
            <div className="relative">
              <input
                id="medicine"
                type="text"
                className="input-field pr-12"
                placeholder="e.g., Oxycodone, Diazepam, Xanax..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-teal-600 hover:bg-teal-50 disabled:opacity-40 transition-colors"
              >
                {loading ? <Spinner size="sm" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            className="btn-primary w-full sm:w-auto"
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
          >
            <AlertTriangle className="h-4 w-4" />
            Check Risk Profile
          </button>
        </div>

        {/* Quick searches */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-500">Quick lookups:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map((qs) => (
              <button
                key={qs.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                onClick={() => {
                  setQuery(qs.name.split(' ')[0]);
                  handleSearch(qs.name.split(' ')[0]);
                }}
              >
                {qs.name}
              </button>
            ))}
          </div>
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
          <p className="mt-3 text-sm text-slate-500">Checking dependency risk profile...</p>
        </div>
      )}

      {result && <RiskCard result={result} />}

      {/* Empty state */}
      {!loading && !result && (
        <div className="card p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-medium text-slate-600">No results yet</h3>
          <p className="mt-1 text-xs text-slate-400">
            Enter a medicine name and click &quot;Check Risk Profile&quot; to view dependency information.
          </p>
        </div>
      )}
    </div>
  );
}

function RiskCard({ result }: { result: AddictionRiskResponse }) {
  const navigate = useNavigate();
  const config = riskConfig[result.riskLevel] || riskConfig.unknown;
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      {/* Risk level banner */}
      <div className={`card overflow-hidden border-l-4 ${result.riskLevel === 'high' ? 'border-l-red-500' : result.riskLevel === 'moderate' ? 'border-l-amber-500' : result.riskLevel === 'low' ? 'border-l-green-500' : 'border-l-slate-400'}`}>
        <div className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900 capitalize sm:text-lg">{result.medicineName}</h2>
                {result.matchedAlias && (
                  <p className="text-xs text-slate-500">Matched as: {result.matchedAlias}</p>
                )}
              </div>
            </div>
            <Badge variant={config.color} className="text-xs sm:text-sm px-3 py-1 self-start sm:self-auto">
              {config.label}
            </Badge>
          </div>

          {/* Risk bar */}
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>Dependency Risk Level</span>
              <span className="font-semibold">{config.label}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200">
              <div className={`h-3 rounded-full ${config.barColor} ${config.barWidth} transition-all duration-500`} />
            </div>
          </div>

          {/* Details grid */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.drugClass && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Drug Class</h4>
                <p className="text-sm font-medium text-slate-800">{result.drugClass}</p>
              </div>
            )}
            {result.dependencyType && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Dependency Type</h4>
                <p className="text-sm text-slate-700">{result.dependencyType}</p>
              </div>
            )}
            {result.schedule && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Controlled Substance Schedule</h4>
                <p className="text-sm text-slate-700">{result.schedule}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="card p-5">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Info className="h-4 w-4 text-blue-500" />
          Explanation
        </h3>
        <p className="text-sm leading-relaxed text-slate-700">{result.explanation}</p>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Warnings & Important Notes
          </h3>
          <ul className="space-y-2">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Online AI Doctor Action */}
      {(result.riskLevel === 'high' || result.riskLevel === 'moderate') && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shrink-0">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Dependency & Safety Guidance</h4>
              <p className="text-xs text-slate-300">Consult our Online AI Doctor Assistant about safe usage, tapering, or non-addictive alternatives for {result.medicineName}.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/ai-doctor', { state: { medicineName: result.medicineName, addictionRisk: `${result.riskLevel.toUpperCase()} dependency risk - ${result.explanation}` } })}
            className="btn-primary shrink-0 bg-primary-500 hover:bg-primary-400 text-white border-none py-2 px-4 text-xs font-semibold"
          >
            Consult Online AI Doctor
          </button>
        </div>
      )}

      {/* Data sources & disclaimer */}
      {result.dataSources.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Data Sources</h3>
          <div className="flex flex-wrap gap-2">
            {result.dataSources.map((source, i) => (
              <Badge key={i} variant="info">{source}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
        {result.disclaimer}
      </div>
    </div>
  );
}
