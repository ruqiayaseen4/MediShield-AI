import {
  Shield,
  ScanBarcode,
  Pill,
  AlertTriangle,
  Search,
  Clock,
  Bell,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { EmptyState } from '@/components/common/EmptyState';

export function Dashboard() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-teal-700 p-6 text-white shadow-xl shadow-primary-600/20 sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        </div>
        <div className="relative">
          <p className="text-primary-100 text-sm font-medium">Welcome back</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{firstName}</h1>
          <p className="mt-2 max-w-lg text-sm text-primary-100 sm:text-base">
            Your medicine safety overview is below. Use the quick actions to verify medicines,
            check interactions, or search for drug information.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/verify" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/25">
              <Shield className="h-4 w-4" /> Verify Medicine
            </Link>
            <Link to="/interactions" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/25">
              <Pill className="h-4 w-4" /> Check Interactions
            </Link>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Shield} label="Verifications" value="0" gradient="from-teal-500 to-emerald-600" />
        <StatCard icon={Pill} label="Interaction Checks" value="0" gradient="from-violet-500 to-purple-600" />
        <StatCard icon={AlertTriangle} label="Risk Lookups" value="0" gradient="from-amber-500 to-orange-600" />
        <StatCard icon={Bell} label="Safety Alerts" value="0" gradient="from-rose-500 to-pink-600" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="stagger-children grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction icon={Shield} label="Verify Medicine" desc="Upload image & check authenticity" href="/verify" gradient="from-teal-500 to-emerald-600" />
          <QuickAction icon={ScanBarcode} label="Scan Barcode" desc="Camera-based barcode scanner" href="/scanner" gradient="from-blue-500 to-cyan-600" />
          <QuickAction icon={Pill} label="Check Interactions" desc="Multi-drug interaction analysis" href="/interactions" gradient="from-violet-500 to-purple-600" />
          <QuickAction icon={AlertTriangle} label="Addiction Risk" desc="Dependency risk profiles" href="/addiction-risk" gradient="from-amber-500 to-orange-600" />
          <QuickAction icon={Search} label="Search Medicine" desc="FDA & RxNorm database search" href="/search" gradient="from-green-500 to-emerald-600" />
          <QuickAction icon={TrendingUp} label="About & Safety" desc="Learn how MediShield AI works" href="/about" gradient="from-rose-500 to-pink-600" />
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Medicine Checks</h2>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <EmptyState
            title="No recent checks"
            message="Your medicine verification history will appear here."
            icon={<Clock className="mb-3 h-8 w-8 text-slate-300" />}
            action={
              <Link to="/verify" className="btn-primary text-sm">
                Verify Medicine <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Interactions</h2>
            <Pill className="h-5 w-5 text-slate-400" />
          </div>
          <EmptyState
            title="No recent checks"
            message="Your drug interaction history will appear here."
            icon={<Pill className="mb-3 h-8 w-8 text-slate-300" />}
            action={
              <Link to="/interactions" className="btn-primary text-sm">
                Check Interactions <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      </div>

      {/* Saved medicines and alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Saved Medicines</h2>
            <Shield className="h-5 w-5 text-slate-400" />
          </div>
          <EmptyState
            title="No saved medicines"
            message="Save medicines from your searches to quickly access them later."
          />
        </div>
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Safety Alerts
            </h2>
            <Bell className="h-5 w-5 text-slate-400" />
          </div>
          <EmptyState
            title="No alerts"
            message="You have no safety alerts at this time."
            icon={<Bell className="mb-3 h-8 w-8 text-slate-300" />}
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  desc,
  href,
  gradient,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  href: string;
  gradient: string;
}) {
  return (
    <Link
      to={href}
      className="group card-hover flex items-center gap-4 p-4"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">{label}</p>
        <p className="text-xs text-slate-500 truncate">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:text-primary-500 group-hover:translate-x-1" />
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
