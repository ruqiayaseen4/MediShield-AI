import { Link } from 'react-router-dom';
import {
  Shield, ScanBarcode, Pill, AlertTriangle, Search, LayoutDashboard,
  PillBottle, ArrowRight, CheckCircle2, Sparkles, Database, Heart,
  ChevronRight, Star, ShieldCheck
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Medicine Verification',
    description: 'Upload medicine packaging images for AI-powered authenticity analysis against trusted FDA databases.',
    href: '/verify',
    gradient: 'from-teal-500 to-emerald-600',
    lightBg: 'bg-teal-50',
  },
  {
    icon: ScanBarcode,
    title: 'Barcode Scanner',
    description: 'Scan medicine barcodes in real-time using your camera to instantly identify and verify products.',
    href: '/scanner',
    gradient: 'from-blue-500 to-cyan-600',
    lightBg: 'bg-blue-50',
  },
  {
    icon: Pill,
    title: 'Drug Interaction Checker',
    description: 'Check potential interactions between multiple medicines with severity-rated, evidence-based analysis.',
    href: '/interactions',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
  },
  {
    icon: AlertTriangle,
    title: 'Addiction Risk Profiles',
    description: 'View known dependency risk profiles, controlled substance schedules, and withdrawal warnings.',
    href: '/addiction-risk',
    gradient: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
  },
  {
    icon: Search,
    title: 'Medicine Search',
    description: 'Search comprehensive medicine databases for detailed drug information, ingredients, and warnings.',
    href: '/search',
    gradient: 'from-green-500 to-emerald-600',
    lightBg: 'bg-green-50',
  },
  {
    icon: LayoutDashboard,
    title: 'Personal Dashboard',
    description: 'Track your recent checks, saved medicines, and safety alerts in a centralized overview.',
    href: '/dashboard',
    gradient: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50',
  },
];

const stats = [
  { value: 'FDA', label: 'OpenFDA Drug Database', icon: Database },
  { value: 'NLM', label: 'RxNorm & DailyMed', icon: Database },
  { value: 'NDC', label: 'National Drug Codes', icon: Database },
  { value: '30+', label: 'Interaction Pairs', icon: Pill },
];

const trustPoints = [
  { icon: ShieldCheck, text: 'Never claims a medicine is definitely fake' },
  { icon: CheckCircle2, text: 'Evidence-based interaction data only' },
  { icon: Heart, text: 'Always recommends professional consultation' },
  { icon: Star, text: 'Shows confidence levels & data sources' },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/25">
              <PillBottle className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold tracking-tight text-slate-900">MediShield</span>
              <span className="text-xl font-bold tracking-tight text-primary-600"> AI</span>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Link to="/login" className="btn-ghost">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Mobile buttons */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link to="/login" className="btn-ghost py-2 px-3 text-xs">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary py-2 px-3 text-xs">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-mesh pt-24 sm:pt-32">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-primary-200/20 blur-3xl" />
          <div className="absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">AI-Powered Medicine Safety Platform</span>
            </div>

            <h1 className="animate-fade-in-up text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
              Detect Fake Medicines.{' '}
              <span className="gradient-text">Protect Your Health.</span>
            </h1>

            <p className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-base text-slate-500 sm:text-lg md:text-xl" style={{ animationDelay: '0.15s' }}>
              MediShield AI combines intelligent analysis with trusted FDA, NLM, and NDC databases
              to help you verify medicine authenticity, check drug interactions, and assess dependency risks.
            </p>

            <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center" style={{ animationDelay: '0.3s' }}>
              <Link to="/register" className="btn-primary px-8 py-3.5 text-base shadow-lg shadow-primary-500/25">
                Start Protecting Yourself
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/about" className="btn-secondary px-8 py-3.5 text-base">
                Learn How It Works
              </Link>
            </div>

            {/* Trust micro-points */}
            <div className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500" style={{ animationDelay: '0.45s' }}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                HIPAA-friendly design
              </span>
            </div>
          </div>

          {/* Hero visual - mock dashboard preview */}
          <div className="animate-fade-in-up relative mx-auto mt-16 max-w-4xl" style={{ animationDelay: '0.5s' }}>
            <div className="card-glass overflow-hidden p-1">
              <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <Shield className="mb-2 h-6 w-6 text-emerald-400" />
                    <p className="text-sm font-medium text-white">Verification</p>
                    <p className="mt-1 text-xs text-slate-400">AI-powered authenticity check</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <Pill className="mb-2 h-6 w-6 text-blue-400" />
                    <p className="text-sm font-medium text-white">Interactions</p>
                    <p className="mt-1 text-xs text-slate-400">30+ curated drug pairs</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <AlertTriangle className="mb-2 h-6 w-6 text-amber-400" />
                    <p className="text-sm font-medium text-white">Risk Profiles</p>
                    <p className="mt-1 text-xs text-slate-400">Dependency & schedule info</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-primary-500/10 via-blue-500/10 to-violet-500/10 blur-2xl" />
          </div>
        </div>

        {/* Bottom wave */}
        <div className="mt-20">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 30C1200 0 960 0 720 30C480 60 240 60 0 30L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="relative bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Comprehensive Medicine Safety
            </h2>
            <p className="mt-4 text-base text-slate-500 sm:text-lg">
              Everything you need to verify, analyze, and stay safe with your medications — all in one place.
            </p>
          </div>

          <div className="stagger-children mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.href}
                to={feature.href}
                className="group card-hover relative overflow-hidden p-6"
              >
                {/* Gradient icon */}
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg shadow-slate-200`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-primary-700">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600 opacity-0 transition-all group-hover:opacity-100">
                  Explore <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Safety principles */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built on Safety Principles
              </h2>
              <p className="mt-4 text-base text-slate-500 sm:text-lg">
                MediShield AI follows strict safety rules. We never overstate what we know, and we always point you to professional help.
              </p>
              <Link to="/register" className="btn-primary mt-8">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {trustPoints.map((tp, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md"
                >
                  <tp.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" />
                  <p className="text-sm font-medium text-slate-700">{tp.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data sources */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Powered by Trusted Databases
            </h2>
            <p className="mt-4 text-base text-slate-500">
              We rely on authoritative, publicly available medical data sources.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="card-hover p-6 text-center">
                <stat.icon className="mx-auto mb-3 h-8 w-8 text-primary-500" />
                <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-teal-800 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to protect yourself and your family?
          </h2>
          <p className="mt-4 text-base text-primary-100 sm:text-lg">
            Join MediShield AI and start verifying your medicines today. It&apos;s free, secure, and takes seconds.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-primary-700 shadow-lg transition-all hover:bg-primary-50 hover:-translate-y-0.5"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <PillBottle className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-semibold text-slate-900">MediShield AI</span>
            </div>
            <p className="text-center text-xs text-slate-400 sm:text-sm">
              MediShield AI is an assistance tool and cannot replace professional medical advice.
              Always consult a qualified healthcare provider.
            </p>
            <div className="flex gap-4">
              <Link to="/about" className="text-xs text-slate-400 hover:text-primary-600 transition-colors">About</Link>
              <Link to="/login" className="text-xs text-slate-400 hover:text-primary-600 transition-colors">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
