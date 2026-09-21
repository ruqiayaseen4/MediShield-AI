import { Shield, Database, AlertTriangle, PillBottle, ExternalLink, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="space-y-8">
      {/* Hero section for About page */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white sm:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
        </div>
        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-3 w-3" /> About the Platform
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About MediShield AI</h1>
          <p className="mt-3 text-base text-slate-300 sm:text-lg">
            Understanding how our medicine safety platform works, the data sources we use, and our commitment to safety.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Purpose */}
        <div className="card-hover p-6 sm:p-8">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-teal-600 shadow-lg shadow-primary-200">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Our Purpose</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                MediShield AI is a healthcare safety application designed to help users verify
                medicine authenticity, check drug interactions, and understand dependency risks. We
                combine AI-assisted analysis with trusted medical databases to provide actionable
                safety information — never replacing, but always supporting, professional medical judgment.
              </p>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="card-hover p-6 sm:p-8">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-200">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">Data Sources</h2>
              <p className="mt-2 text-sm text-slate-600">
                We rely on authoritative, publicly available medical databases:
              </p>
              <div className="mt-4 space-y-3">
                <DataSource
                  name="OpenFDA Drug API"
                  description="Drug labels, adverse events, and recall data from the U.S. Food and Drug Administration."
                  url="https://open.fda.gov/"
                />
                <DataSource
                  name="NLM RxNorm"
                  description="Normalized clinical drug names and ingredient information from the National Library of Medicine."
                  url="https://www.nlm.nih.gov/research/umls/rxnorm/"
                />
                <DataSource
                  name="FDA National Drug Code (NDC)"
                  description="Official directory of drug products marketed in the United States."
                  url="https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory"
                />
                <DataSource
                  name="DailyMed (NLM)"
                  description="Current, high-quality information about marketed drugs including package inserts."
                  url="https://dailymed.nlm.nih.gov/"
                />
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="card-hover p-6 sm:p-8">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-purple-200">
              <PillBottle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">How It Works</h2>
              <div className="mt-4 space-y-0">
                {[
                  { step: '1', title: 'Image Analysis', desc: 'Upload a medicine package photo. Tesseract.js extracts text from the image (OCR only — not AI detection).' },
                  { step: '2', title: 'AI Analysis Engine', desc: 'The extracted text and barcode data are sent to our pluggable AI analysis engine, which cross-references against trusted databases (OpenFDA, NDC, RxNorm).' },
                  { step: '3', title: 'Structured Results', desc: 'The system returns a verification status, confidence level, suspicious indicators, evidence list, and safety recommendations.' },
                  { step: '4', title: 'Drug Interactions', desc: 'Enter multiple medicines to check for known interactions using our curated pharmacology database of 30+ well-known drug pairs with severity ratings.' },
                  { step: '5', title: 'Addiction Risk', desc: 'Look up dependency risk profiles for 15+ controlled substances including drug class, schedule, and withdrawal warnings.' },
                ].map((item, i) => (
                  <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {i < 4 && (
                      <div className="absolute left-[15px] top-8 h-full w-px bg-slate-200" />
                    )}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 ring-4 ring-white">
                      {item.step}
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/80 p-6 sm:p-8">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-200 shadow-sm">
              <AlertTriangle className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-900">Important Safety Disclaimer</h2>
              <div className="mt-3 space-y-3 text-sm text-amber-800">
                <p className="font-semibold text-base">
                  MediShield AI is an assistance tool and cannot replace professional medical
                  advice, pharmacist verification, or laboratory testing.
                </p>
                <p>
                  The AI analysis provided by this application is based on available data and
                  pattern recognition. It should never be used as the sole basis for health
                  decisions.
                </p>
                <div>
                  <p className="font-semibold mb-2">This tool will never:</p>
                  <div className="space-y-2">
                    {[
                      'Claim a medicine is definitely fake without reliable laboratory evidence',
                      'Invent drug interactions that are not supported by medical data',
                      'Provide personalized medical diagnoses or prescriptions',
                      'Replace consultation with a qualified healthcare provider',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p>
                  Always consult your doctor, pharmacist, or healthcare provider before making any
                  decisions about your medications.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="card p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Ready to get started?</h2>
          <p className="mt-2 text-sm text-slate-500">Create a free account and start checking your medicines today.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataSource({ name, description, url }: { name: string; description: string; url: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:shadow-sm hover:bg-white">
      <div>
        <p className="font-semibold text-slate-900">{name}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 rounded-lg p-2 text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
