import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanBarcode as ScanIcon, Loader2, CheckCircle2, AlertTriangle, HelpCircle, XCircle, X, Stethoscope } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { medicineApi, aiApi, type NDCLookupResult } from '@/services/api';
import type { AIAnalysisResponse } from '@/types';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';
import { Badge } from '@/components/ui/Badge';

export function MedicineScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ndcResult, setNdcResult] = useState<NDCLookupResult | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setError(null);
    setAiResult(null);
    setNdcResult(null);
    setScannedCode(null);

    if (!containerRef.current) return;

    try {
      const scanner = new Html5Qrcode('barcode-reader');
      scannerRef.current = scanner;
      setIsScanning(true);

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
        },
        async (decodedText) => {
          // Stop scanning once a code is detected
          await scanner.stop();
          setIsScanning(false);
          setScannedCode(decodedText);
          analyzeBarcode(decodedText);
        },
        () => {
          // Scan failure callback (fires per frame) — ignore
        }
      );
    } catch (err) {
      setIsScanning(false);
      setError('Could not access camera. Please allow camera permissions or enter a barcode manually.');
      console.error('[Scanner] Start error:', err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop().catch(() => {});
    }
    setIsScanning(false);
  };

  const analyzeBarcode = useCallback(async (code: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Step 1: NDC lookup
      const ndc = await medicineApi.lookupNDC(code);
      setNdcResult(ndc);

      // Step 2: AI analysis
      const trustedData: Record<string, unknown> = {};
      let identifiedMedicine: Record<string, string> | undefined;

      if (ndc.found && ndc.ndc) {
        trustedData.ndcMatch = ndc.ndc as unknown as Record<string, unknown>;
        identifiedMedicine = {
          name: ndc.ndc.brand_name || ndc.ndc.generic_name || '',
          ndcCode: ndc.ndc.product_ndc || '',
          manufacturer: ndc.ndc.labeler_name || '',
          dosageForm: ndc.ndc.dosage_form || '',
        };
      }

      // Also search OpenFDA if we have a name
      const searchQuery = identifiedMedicine?.name || '';
      if (searchQuery) {
        try {
          const searchResult = await medicineApi.search(searchQuery);
          if (searchResult.openfda.length > 0) {
            trustedData.openfdaResults = searchResult.openfda.slice(0, 3);
          }
        } catch {
          // Non-critical
        }
      }

      const result = await aiApi.analyzeMedicine({
        barcodeData: code,
        identifiedMedicine: identifiedMedicine as {
          name: string; ndcCode?: string; activeIngredient?: string; manufacturer?: string; dosageForm?: string;
        } | undefined,
        trustedData: trustedData as {
          openfdaResults?: Record<string, unknown>[]; ndcMatch?: Record<string, unknown>;
        },
        analysisType: 'verification',
      });

      setAiResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Manual barcode input
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = (document.getElementById('manual-barcode') as HTMLInputElement)?.value?.trim();
    if (input) {
      setScannedCode(input);
      analyzeBarcode(input);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Medicine Scanner</h1>
        <p className="page-subtitle">
          Use your camera to scan a medicine barcode for instant verification.
        </p>
      </div>

      <SafetyDisclaimer />

      <div className="card p-5 sm:p-6">
        {/* Scanner viewfinder */}
        <div className="relative">
          <div
            ref={containerRef}
            id="barcode-reader"
            className="overflow-hidden rounded-xl bg-slate-900"
            style={{ minHeight: isScanning ? 300 : 0 }}
          />
          {!isScanning && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-900 p-10 text-center sm:p-16">
              <ScanIcon className="mb-4 h-16 w-16 text-slate-500" />
              <p className="text-lg font-medium text-white">Camera Scanner</p>
              <p className="mt-1 text-sm text-slate-400">
                Point your camera at a medicine barcode to scan it.
              </p>
              <button onClick={startScanner} className="btn-primary mt-6">
                <ScanIcon className="h-4 w-4" />
                Start Scanner
              </button>
            </div>
          )}
          {isScanning && (
            <button
              onClick={stopScanner}
              className="absolute right-3 top-3 rounded-lg bg-black/60 p-2 text-white hover:bg-black/80"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Manual entry fallback */}
        <form onSubmit={handleManualSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            id="manual-barcode"
            type="text"
            className="input-field flex-1"
            placeholder="Or enter barcode / NDC code manually..."
          />
          <button type="submit" className="btn-primary shrink-0">
            Look Up
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {isAnalyzing && (
        <div className="card flex items-center gap-3 p-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
          <span className="text-sm font-medium text-slate-700">
            Analyzing barcode: <span className="font-mono">{scannedCode}</span>
          </span>
        </div>
      )}

      {/* NDC result */}
      {ndcResult && scannedCode && (
        <div className="card p-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Barcode Lookup</h2>
          <p className="text-sm text-slate-500">
            Scanned code: <span className="font-mono font-medium text-slate-700">{scannedCode}</span>
          </p>
          {ndcResult.found ? (
            <div className="mt-3 space-y-2">
              <InfoRow label="Brand Name" value={ndcResult.ndc?.brand_name || 'N/A'} />
              <InfoRow label="Generic Name" value={ndcResult.ndc?.generic_name || 'N/A'} />
              <InfoRow label="Labeler" value={ndcResult.ndc?.labeler_name || 'N/A'} />
              <InfoRow label="Dosage Form" value={ndcResult.ndc?.dosage_form || 'N/A'} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              {String(ndcResult.message || 'No match found in the NDC database for this code.')}
            </p>
          )}
        </div>
      )}

      {/* AI Analysis Result */}
      {aiResult && <ScannerAnalysisCard result={aiResult} />}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium text-slate-500">{label}:</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}

function ScannerAnalysisCard({ result }: { result: AIAnalysisResponse }) {
  const navigate = useNavigate();
  const statusConfig: Record<AIAnalysisResponse['status'] | 'not_found', {
    icon: typeof CheckCircle2;
    color: string;
    bg: string;
    badge: 'success' | 'danger' | 'warning' | 'default';
    label: string;
  }> = {
    verified: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200', badge: 'success', label: 'Verified' },
    suspicious: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', badge: 'danger', label: 'Suspicious' },
    needs_verification: { icon: HelpCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', badge: 'warning', label: 'Needs Verification' },
    invalid_image: { icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', badge: 'warning', label: 'Non-Medicine / Human Image' },
    non_medicine: { icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', badge: 'warning', label: 'Non-Medicine Image' },
    not_found: { icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', badge: 'default', label: 'Not Found' },
  };

  const cfg = statusConfig[result.status] || statusConfig.not_found;
  const StatusIcon = cfg.icon;

  return (
    <div className={`animate-fade-in overflow-hidden rounded-2xl border-2 p-4 shadow-sm sm:p-6 ${cfg.bg}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <StatusIcon className={`h-8 w-8 flex-shrink-0 ${cfg.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">AI Analysis Result</h2>
            <Badge variant={cfg.badge}>{cfg.label}</Badge>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Confidence:</span>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full ${result.confidence >= 0.7 ? 'bg-green-500' : result.confidence >= 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">{Math.round(result.confidence * 100)}%</span>
          </div>

          {result.evidence.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700">Evidence</h3>
              <ul className="mt-1 space-y-1">
                {result.evidence.map((e, i) => (
                  <li key={i} className="text-sm text-slate-600"><span className="mr-1.5 text-green-600">+</span>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {result.suspiciousIndicators.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-700">Suspicious Indicators</h3>
              {result.suspiciousIndicators.map((ind, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={ind.severity === 'high' ? 'danger' : ind.severity === 'medium' ? 'warning' : 'default'}>{ind.severity}</Badge>
                    <span className="text-sm font-medium text-slate-900">{ind.indicator}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{ind.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {result.dataSources.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700">Data Sources</h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {result.dataSources.map((src, i) => (
                  <Badge key={i} variant="info">{src}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-700">Safety Recommendation</h3>
            <p className="mt-1 text-sm text-slate-600">{result.safetyRecommendation}</p>
          </div>

          {/* Online AI Doctor Action */}
          {(result.status === 'suspicious' || result.status === 'needs_verification' || result.suspiciousIndicators.length > 0) && (
            <div className="mt-4 rounded-xl bg-gradient-to-r from-primary-900 to-slate-900 p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shrink-0">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Harmful or Suspicious Medicine Alert</h4>
                  <p className="text-xs text-slate-300">Consult our Online AI Doctor Assistant for immediate medical guidance.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/ai-doctor', { state: { harmfulReason: result.safetyRecommendation } })}
                className="btn-primary shrink-0 bg-primary-500 hover:bg-primary-400 text-white border-none py-2 px-4 text-xs font-semibold"
              >
                Consult Online AI Doctor
              </button>
            </div>
          )}

          <p className="mt-4 text-xs italic text-slate-500">{result.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
