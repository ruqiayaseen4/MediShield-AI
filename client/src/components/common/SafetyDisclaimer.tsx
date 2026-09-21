import { AlertTriangle } from 'lucide-react';

const DISCLAIMER_TEXT =
  'This tool provides AI-assisted analysis and is not a substitute for professional medical advice, pharmacist verification, or laboratory testing. Always consult a qualified healthcare provider.';

export function SafetyDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/50 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
      </div>
      <div>
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Safety Notice:</span> {DISCLAIMER_TEXT}
        </p>
      </div>
    </div>
  );
}
