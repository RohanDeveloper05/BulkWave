import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from "lucide-react";
import logo from "../assets/logo01-nobg.png";
import "../styles/Layout.css";
import {
  LayoutDashboard,
  CreditCard as Edit,
  Users,
  // BarChart3,
  // Settings,
  // Shield,
  Menu,
  X,
  FilePen,
  // Mail,
  User,
  FileCode
} from 'lucide-react';
import clsx from 'clsx';
import axios from "axios";


interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Compose', href: '/compose', icon: Edit },
  { name: 'Recipients', href: '/recipients', icon: Users },
  { name: 'Attachments', href: '/attachments', icon: FilePen },
  { name: 'Templates', href: '/emailtemplates', icon: FileCode },
  // { name: 'Reports', href: '/reports', icon: BarChart3 },
  // { name: 'Settings', href: '/settings', icon: Settings },
  // { name: 'Admin', href: '/admin', icon: Shield },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className={`bw-dashboard ${theme} min-h-screen`}>
      <div className="bubbles" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${8 + Math.random() * 24}px`,
              height: `${8 + Math.random() * 24}px`,
              animationDuration: `${12 + Math.random() * 18}s`,
              animationDelay: `${Math.random() * 12}s`,
            }}
          />
        ))}
      </div>

      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-40 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col glass-sidebar">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent currentPath={location.pathname} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 glass-sidebar">
          <SidebarContent currentPath={location.pathname} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 glass-navbar px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex items-center p-2 rounded-md text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

            <div className="flex items-center gap-2">

              <button
                type="button"
                className="theme-toggle"
                onClick={() =>
                  setTheme(theme === "light" ? "dark" : "light")
                }
              >
                {theme === "light" ? (
                  <Moon size={18} />
                ) : (
                  <Sun size={18} />
                )}
              </button>

              <button
                type="button"
                className="rounded-xl p-2 glass-card"
              >
                <User className="h-5 w-5" />
              </button>

            </div>
            
        </div>

        {/* Page content */}
        <main className="relative z-10 py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ currentPath }: { currentPath: string }) {
  const [limitData, setLimitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLimit = async () => {
      try {
        const res = await axios.get(
          // "https://bulkwave.rohankumar.online/api/data/emaillimit/"
          "http://127.0.0.1:8000/api/data/emaillimit/"  
        );
        setLimitData(res.data);
      } catch (err) {
        console.error("Email Limit Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLimit();
  }, []);

  const percent =
    limitData && limitData.daily_limit 
      ? (limitData.sent_last_24_hours / limitData.daily_limit) * 100
      : 0;

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Bulk Wave logo" className="bw-brand__logo" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4">
        <ul role="list" className="space-y-1">
          {navigation.map((item) => {
            const isCurrent = currentPath === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={clsx(
                    isCurrent
                      ? "bg-white/60 text-sky-700 backdrop-blur-xl shadow-md"
                      : "text-slate-600 hover:bg-white/40 hover:text-sky-700",
                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition"
                  )}
                >
                  <item.icon className="h-6 w-6 shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ✅ EMAIL LIMIT (BOTTOM) */}
      <div className="mt-auto mb-4">
        <div className="rounded-xl p-4 glass-card shadow-sm">

          <p className="text-xs text-gray-500 mb-1">Email Usage</p>

          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <>
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Stats */}
              <div className="mt-2 text-xs text-gray-600 flex justify-between">
                <span>
                  {limitData.sent_last_24_hours.toLocaleString()} sent
                </span>
                <span>
                  {limitData.daily_limit.toLocaleString()} limit
                </span>
              </div>

              {/* Remaining */}
              <p className="mt-1 text-xs text-gray-400">
                {limitData.remaining.toLocaleString()} remaining
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  );
}