import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  Shield,
  Search,
  ScanBarcode,
  Pill,
  AlertTriangle,
  PillBottle,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/verify', label: 'Verify Medicine', icon: Shield },
  { to: '/scanner', label: 'Medicine Scanner', icon: ScanBarcode },
  { to: '/interactions', label: 'Drug Interactions', icon: Pill },
  { to: '/addiction-risk', label: 'Addiction Risk', icon: AlertTriangle },
  { to: '/search', label: 'Medicine Search', icon: Search },
  { to: '/ai-doctor', label: 'Online AI Doctor', icon: Stethoscope },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
          <PillBottle className="h-5 w-5 text-white" />
          <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-slate-900">MediShield</span>
          <span className="text-lg font-bold tracking-tight text-primary-600"> AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-0.5 px-3 scrollbar-thin overflow-y-auto">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-primary-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white shadow-md shadow-primary-200">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-red-500 hover:shadow-sm"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-white p-2.5 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 transition-all hover:shadow-xl lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-slate-100 lg:bg-white">
        {sidebarContent}
      </aside>
    </>
  );
}
