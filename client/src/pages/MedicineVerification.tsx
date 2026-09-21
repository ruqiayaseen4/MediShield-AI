import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, Barcode, CheckCircle2, AlertTriangle, XCircle, HelpCircle, Loader2, FileImage, Stethoscope } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { medicineApi, aiApi } from '@/services/api';
import type { AIAnalysisResponse } from '@/types';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';
import { Badge } from '@/components/ui/Badge';

export function MedicineVerification() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [aiResult, setAiResult] = useState<AIAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleImageUpload = useCallback((file: File) => {
    setImage(file);
    setAiResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  // Handle drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleImageUpload(file);
  };

  // Convert any image format (AVIF, WEBP, etc.) to PNG via canvas
  const convertToCanvasBlob = useCallback((imgSrc: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob returned null'));
          },
          'image/png'
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for conversion'));
      img.src = imgSrc;
    });
  }, []);

  // Run OCR on uploaded image
  const runOcr = async () => {
    if (!image || !imagePreview) return;
    setIsOcrRunning(true);
    setOcrProgress(0);
    setOcrText('');
    setError(null);

    try {
      let ocrInput: Blob | File = image;
      const unsupportedFormats = ['image/avif', 'image/webp', 'image/heic', 'image/heif'];
      if (unsupportedFormats.includes(image.type) || !['image/png', 'image/jpeg', 'image/bmp'].includes(image.type)) {
        try {
          ocrInput = await convertToCanvasBlob(imagePreview);
        } catch {
          ocrInput = image;
        }
      }

      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });
      const { data } = await worker.recognize(ocrInput);
      const extractedText = data.text?.trim() || '';
      setOcrText(extractedText);
      await worker.terminate();

      if (!extractedText) {
        setError('No text was detected in the image. AI Vision will inspect the image visual structure.');
      }
    } catch (err) {
      console.error('[OCR] Error:', err);
      setError(
        err instanceof Error && err.message.includes('canvas')
          ? 'Image conversion failed. Please try a different image format.'
          : 'OCR processing failed. Continuing with AI visual image analysis.'
      );
    } finally {
      setIsOcrRunning(false);
    }
  };

  // Run AI analysis
  const runAnalysis = async () => {
    if (!ocrText && !barcodeInput.trim() && !imagePreview) {
      setError('Please provide an image or enter a barcode to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAiResult(null);

    try {
      // Step 1: Look up trusted data via barcode or name
      let trustedData: Record<string, unknown> = {};
      let identifiedMedicine: Record<string, string> | undefined;

      if (barcodeInput.trim()) {
        const ndcResult = await medicineApi.lookupNDC(barcodeInput.trim());
        if (ndcResult.found && ndcResult.ndc) {
          trustedData.ndcMatch = ndcResult.ndc;
          identifiedMedicine = {
            name: ndcResult.ndc.brand_name || ndcResult.ndc.generic_name || '',
            ndcCode: ndcResult.ndc.product_ndc || '',
            manufacturer: ndcResult.ndc.labeler_name || '',
            dosageForm: ndcResult.ndc.dosage_form || '',
          };
        }
      }

      // Try to extract a medicine name from OCR text for OpenFDA search
      const medicineNameGuess = ocrText.split('\n').find((line) => line.trim().length > 3 && line.trim().length < 60)?.trim();
      if (medicineNameGuess) {
        try {
          const searchResult = await medicineApi.search(medicineNameGuess);
          if (searchResult.openfda.length > 0) {
            trustedData.openfdaResults = searchResult.openfda.slice(0, 3);
            if (!identifiedMedicine) {
              identifiedMedicine = {
                name: searchResult.openfda[0].brand_name || searchResult.openfda[0].generic_name || medicineNameGuess,
                manufacturer: searchResult.openfda[0].manufacturer_name || '',
              };
            }
          }
        } catch {
          // Non-critical — continue without OpenFDA data
        }
      }

      // Step 2: Send to AI analysis
      const result = await aiApi.analyzeMedicine({
        ocrText: ocrText || undefined,
        barcodeData: barcodeInput.trim() || undefined,
        imageData: imagePreview || undefined,
        identifiedMedicine: identifiedMedicine as {
          name: string;
          ndcCode?: string;
          activeIngredient?: string;
          manufacturer?: string;
          dosageForm?: string;
        } | undefined,
        trustedData: trustedData as {
          openfdaResults?: Record<string, unknown>[];
          rxnormData?: Record<string, unknown>;
          ndcMatch?: Record<string, unknown>;
        },
        analysisType: 'verification',
      });

      setAiResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Medicine Verification</h1>
        <p className="page-subtitle">
          Upload a medicine package image or enter a barcode to verify its authenticity.
        </p>
      </div>

      <SafetyDisclaimer />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image upload section */}
        <div className="card p-5 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
              <Upload className="h-4 w-4 text-primary-600" />
            </div>
            Upload Image
          </h2>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/30"
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Medicine package"
                  className="max-h-48 rounded-lg object-contain"
                />
                <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <FileImage className="h-3 w-3" />
                  {image?.name}
                </div>
              </div>
            ) : (
              <>
                <Shield className="mb-3 h-10 w-10 text-slate-400" />
                <p className="text-sm font-medium text-slate-600">
                  Drop a medicine package image here
                </p>
                <p className="mt-1 text-xs text-slate-400">PNG, JPG, WEBP, AVIF up to 10MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {image && (
            <button
              onClick={runOcr}
              disabled={isOcrRunning}
              className="btn-secondary mt-4 w-full"
            >
              {isOcrRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting text... {ocrProgress}%
                </>
              ) : (
                'Extract Text (OCR)'
              )}
            </button>
          )}

          {/* OCR progress bar */}
          {isOcrRunning && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Extracted text */}
          {ocrText && (
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Extracted Text</label>
              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="input-field h-32 resize-none font-mono text-xs"
                placeholder="OCR-extracted text will appear here..."
              />
              <p className="mt-1 text-xs text-slate-500">
                You can edit this text before analysis. OCR is performed by Tesseract.js (text extraction only).
              </p>
            </div>
          )}
        </div>

        {/* Barcode input section */}
        <div className="card p-5 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
              <Barcode className="h-4 w-4 text-primary-600" />
            </div>
            Barcode / NDC Code
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="barcode" className="mb-1.5 block text-sm font-medium text-slate-700">
                Enter barcode or NDC code
              </label>
              <input
                id="barcode"
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="input-field"
                placeholder="e.g., 012345678905 or 00093-1062-01"
              />
            </div>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || (!ocrText && !barcodeInput.trim())}
              className="btn-primary w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Analyze Medicine
                </>
              )}
            </button>
            <p className="text-xs text-slate-500">
              Enter a barcode/NDC code and optionally upload an image. The AI analysis engine will
              cross-reference against OpenFDA, NDC, and RxNorm databases.
            </p>
          </div>

          {/* Manual OCR text input */}
          {!ocrText && !image && (
            <div className="mt-6 border-t border-slate-200 pt-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Or paste label text manually
              </label>
              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="input-field h-24 resize-none text-sm"
                placeholder="Paste the text from the medicine label here..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* AI Analysis Result */}
      {aiResult && <AnalysisResultCard result={aiResult} />}
    </div>
  );
}

function AnalysisResultCard({ result }: { result: AIAnalysisResponse }) {
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
    invalid_image: { icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', badge: 'warning', label: 'Human / Non-Medicine Image' },
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
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Analysis Result</h2>
            <Badge variant={cfg.badge}>{cfg.label}</Badge>
          </div>

          {/* Confidence */}
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Confidence:</span>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.confidence >= 0.7 ? 'bg-green-500' : result.confidence >= 0.4 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {Math.round(result.confidence * 100)}%
              </span>
            </div>
          </div>

          {/* Evidence */}
          {result.evidence.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700">Evidence</h3>
              <ul className="mt-1 space-y-1">
                {result.evidence.map((e, i) => (
                  <li key={i} className="text-sm text-slate-600">
                    <span className="mr-1.5 text-green-600">+</span>{e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suspicious indicators */}
          {result.suspiciousIndicators.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700">Suspicious Indicators</h3>
              <div className="mt-2 space-y-2">
                {result.suspiciousIndicators.map((ind, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={ind.severity === 'high' ? 'danger' : ind.severity === 'medium' ? 'warning' : 'default'}>
                        {ind.severity}
                      </Badge>
                      <span className="text-sm font-medium text-slate-900">{ind.indicator}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{ind.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data sources */}
          {result.dataSources.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700">Data Sources Consulted</h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {result.dataSources.map((src, i) => (
                  <Badge key={i} variant="info">{src}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Safety recommendation */}
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

          {/* Disclaimer */}
          <p className="mt-4 text-xs italic text-slate-500">{result.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
