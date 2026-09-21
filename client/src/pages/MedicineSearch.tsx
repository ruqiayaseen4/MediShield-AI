import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Pill, Building2, FlaskConical, AlertCircle, Loader2, X, Stethoscope } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { medicineApi, type MedicineSearchResult } from '@/services/api';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';
import { Badge } from '@/components/ui/Badge';

type SelectedDrug = {
  source: 'openfda' | 'rxnorm';
  name: string;
  id: string;
  details?: Record<string, string>;
};

export function MedicineSearch() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<SelectedDrug | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => {
        setSubmittedQuery(value);
        setShowSuggestions(true);
      }, 400);
    } else {
      setSubmittedQuery('');
      setShowSuggestions(false);
    }
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['medicine-search', submittedQuery],
    queryFn: () => medicineApi.search(submittedQuery),
    enabled: submittedQuery.length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length >= 2) {
      setSubmittedQuery(query);
      setShowSuggestions(true);
    }
  };

  const handleSelectDrug = (drug: SelectedDrug) => {
    setSelectedDrug(drug);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSubmittedQuery('');
    setSelectedDrug(null);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Medicine Search</h1>
        <p className="page-subtitle">
          Search for detailed medicine information including ingredients, dosage, and warnings.
        </p>
      </div>

      <SafetyDisclaimer />

      {/* Search bar */}
      <div className="card p-5 sm:p-6">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => data && setShowSuggestions(true)}
              className="input-field pl-11 pr-10"
              placeholder="Search medicines by name, ingredient, or manufacturer..."
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {isLoading && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
            </div>
          )}
        </form>
      </div>

      {/* Error state */}
      {error && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Search failed'}
          onRetry={() => refetch()}
        />
      )}

      {/* Search results */}
      {submittedQuery && showSuggestions && !selectedDrug && data && (
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-3">
            <p className="text-sm text-slate-500">
              {data.totalResults > 0
                ? `Found ${data.totalResults} results for "${submittedQuery}"`
                : `No results found for "${submittedQuery}"`}
            </p>
          </div>
          {data.totalResults === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No medicines found"
                message={`No results for "${submittedQuery}". Try a different search term.`}
              />
            </div>
          ) : (
            <SearchResults data={data} onSelect={handleSelectDrug} />
          )}
        </div>
      )}

      {/* Drug detail view */}
      {selectedDrug && (
        <DrugDetailView drug={selectedDrug} onBack={() => setSelectedDrug(null)} />
      )}

      {/* Default empty state */}
      {!submittedQuery && !selectedDrug && (
        <EmptyState
          title="Search for a medicine"
          message="Type a medicine name to search across FDA and RxNorm databases."
          icon={<Pill className="mb-3 h-10 w-10 text-slate-400" />}
        />
      )}
    </div>
  );
}

function SearchResults({
  data,
  onSelect,
}: {
  data: MedicineSearchResult;
  onSelect: (drug: SelectedDrug) => void;
}) {
  return (
    <div className="divide-y divide-slate-100">
      {/* OpenFDA results */}
      {data.openfda.map((drug) => (
        <button
          key={drug.id}
          onClick={() =>
            onSelect({
              source: 'openfda',
              name: drug.brand_name || drug.generic_name || 'Unknown',
              id: drug.id,
              details: {
                brand_name: drug.brand_name || '',
                generic_name: drug.generic_name || '',
                manufacturer: drug.manufacturer_name || '',
                active_ingredient: drug.active_ingredient || '',
                dosage_form: drug.dosage_form || '',
                route: drug.route || '',
                warnings: drug.warnings || '',
                indications: drug.indications_and_usage || '',
              },
            })
          }
          className="flex w-full items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
        >
          <div className="rounded-lg bg-teal-100 p-2">
            <Pill className="h-5 w-5 text-teal-700" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900">
              {drug.brand_name || drug.generic_name || 'Unknown Medicine'}
            </p>
            {drug.generic_name && drug.brand_name && (
              <p className="text-sm text-slate-500">Generic: {drug.generic_name}</p>
            )}
            {drug.manufacturer_name && (
              <p className="mt-1 text-xs text-slate-400">{drug.manufacturer_name}</p>
            )}
          </div>
          <Badge variant="info">OpenFDA</Badge>
        </button>
      ))}

      {/* RxNorm results */}
      {data.rxnorm.map((drug) => (
        <button
          key={drug.rxcui}
          onClick={() =>
            onSelect({
              source: 'rxnorm',
              name: drug.name,
              id: drug.rxcui,
            })
          }
          className="flex w-full items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
        >
          <div className="rounded-lg bg-blue-100 p-2">
            <FlaskConical className="h-5 w-5 text-blue-700" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900">{drug.name}</p>
            <p className="text-xs text-slate-400">RxCUI: {drug.rxcui} | Type: {drug.tty}</p>
          </div>
          <Badge variant="default">RxNorm</Badge>
        </button>
      ))}
    </div>
  );
}

function DrugDetailView({
  drug,
  onBack,
}: {
  drug: SelectedDrug;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{drug.name}</h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Source: {drug.source === 'openfda' ? 'OpenFDA' : 'RxNorm'} | ID: {drug.id}
          </p>
        </div>
        <button onClick={onBack} className="btn-secondary text-sm self-start sm:self-auto">
          Back to Results
        </button>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-6">
        {drug.details ? (
          <div className="space-y-4">
            {drug.details.brand_name && (
              <DetailRow icon={<Pill className="h-4 w-4" />} label="Brand Name" value={drug.details.brand_name} />
            )}
            {drug.details.generic_name && (
              <DetailRow icon={<FlaskConical className="h-4 w-4" />} label="Generic Name" value={drug.details.generic_name} />
            )}
            {drug.details.manufacturer && (
              <DetailRow icon={<Building2 className="h-4 w-4" />} label="Manufacturer" value={drug.details.manufacturer} />
            )}
            {drug.details.active_ingredient && (
              <DetailRow icon={<FlaskConical className="h-4 w-4" />} label="Active Ingredient" value={drug.details.active_ingredient} />
            )}
            {drug.details.dosage_form && (
              <DetailRow icon={<Pill className="h-4 w-4" />} label="Dosage Form" value={drug.details.dosage_form} />
            )}
            {drug.details.route && (
              <DetailRow icon={<Pill className="h-4 w-4" />} label="Route" value={drug.details.route} />
            )}

            {drug.details.warnings && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div>
                    <h3 className="font-semibold text-amber-900">Warnings</h3>
                    <p className="mt-1 text-sm whitespace-pre-wrap text-amber-800">
                      {drug.details.warnings.substring(0, 1000)}
                      {drug.details.warnings.length > 1000 && '...'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Online AI Doctor Banner */}
            <div className="mt-6 rounded-xl bg-gradient-to-r from-slate-900 to-primary-950 p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shrink-0">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Have Safety Concerns About {drug.name}?</h4>
                  <p className="text-xs text-slate-300">Consult our Online AI Doctor Assistant for side effect monitoring and safety guidance.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/ai-doctor', { state: { medicineName: drug.name } })}
                className="btn-primary shrink-0 bg-primary-500 hover:bg-primary-400 text-white border-none py-2 px-4 text-xs font-semibold"
              >
                Consult AI Doctor
              </button>
            </div>

            {drug.details.indications && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="font-semibold text-blue-900">Indications & Usage</h3>
                <p className="mt-1 text-sm whitespace-pre-wrap text-blue-800">
                  {drug.details.indications.substring(0, 1000)}
                  {drug.details.indications.length > 1000 && '...'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-sm text-slate-500">
            Detailed information is not available for this drug entry.
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm text-slate-900">{value}</p>
      </div>
    </div>
  );
}
