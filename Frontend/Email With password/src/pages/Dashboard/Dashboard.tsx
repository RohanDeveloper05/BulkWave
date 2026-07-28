import { useState, useEffect } from 'react';
import { fetchKPIData, fetch30DaysTrack } from "../../api/recipients";
import { 
  Send, 
  AlertTriangle, 
  Shield, 
  MousePointer, 
  Eye,
  TrendingUp,
  TrendingDown,
  // Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import clsx from 'clsx';
import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard.css";

// const recentActivity = [
//   {
//     id: 1,
//     campaign: 'Summer Sale Newsletter',
//     recipients: 1250,
//     status: 'completed',
//     timestamp: '2 hours ago'
//   },
//   {
//     id: 2,
//     campaign: 'Product Update Alert',
//     recipients: 850,
//     status: 'sending',
//     timestamp: '4 hours ago'
//   },
//   {
//     id: 3,
//     campaign: 'Welcome Series - Part 3',
//     recipients: 420,
//     status: 'scheduled',
//     timestamp: '1 day ago'
//   },
//   {
//     id: 4,
//     campaign: 'Flash Sale Reminder',
//     recipients: 2100,
//     status: 'completed',
//     timestamp: '2 days ago'
//   }
// ];

export default function Dashboard() {
  type ChartItem = {
    date: string;
    sent: number;
    failed: number;
    spam: number;
    clicks: number;
    opens: number;
  };

  // const [searchParams] = useSearchParams();

  // const type = searchParams.get("type") || "";
  // const filter = searchParams.get("filter") || "this_month";
  // const startDate = searchParams.get("start") || "";
  // const endDate = searchParams.get("end") || "";
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("this_month");
  type DateRange = {
    start: string;
    end: string;
  };

  const [customRange, setCustomRange] = useState<DateRange>({
    start: "",
    end: ""
  });

  const navigate = useNavigate();
  const [appliedRange, setAppliedRange] = useState<DateRange | null>(null);

  const [activeMetrics, setActiveMetrics] = useState({
    sent: true,
    failed: false,
    spam: false,
    clicks: true,
    opens: true
  });

  const toggleMetric = (metric: keyof typeof activeMetrics) => {
    setActiveMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  useEffect(() => {
    if (dateFilter !== "custom") {
      setAppliedRange(null);
    }
  }, [dateFilter]);

  // ✅ FETCH KPI
  useEffect(() => {
    const loadKPI = async () => {
      try {
        setLoading(true); // ✅ always start loading

        // ✅ STOP API if custom not confirmed
        if (dateFilter === "custom" && !appliedRange) {
          setLoading(false); // ✅ FIX: prevent loader stuck
          return;
        }

        const params =
          dateFilter === "custom" && appliedRange
            ? {
                filter: dateFilter,
                start_date: appliedRange.start,
                end_date: appliedRange.end,
              }
            : {
                filter: dateFilter,
              };

        const data = await fetchKPIData(params);

        const formatted = [
          {
            name: 'Sent',
            value: data.sent.current,
            change: data.sent.change_percent === "new" ? "New" : `${data.sent.change_percent}%`,
            trend: data.sent.change_percent === "new"
              ? 'up'
              : data.sent.change_percent >= 0 ? 'up' : 'down',
            icon: Send,
            color: 'blue'
          },
          {
            name: 'Failed',
            value: data.failed.current,
            change: data.failed.change_percent === "new" ? "New" : `${data.failed.change_percent}%`,
            trend: data.failed.change_percent === "new"
              ? 'up'
              : data.failed.change_percent >= 0 ? 'up' : 'down',
            icon: AlertTriangle,
            color: 'red'
          },
          {
            name: 'Spam',
            value: data.spam.current,
            change: data.spam.change_percent === "new" ? "New" : `${data.spam.change_percent}%`,
            trend: data.spam.change_percent === "new"
              ? 'up'
              : data.spam.change_percent >= 0 ? 'up' : 'down',
            icon: Shield,
            color: 'orange'
          },
          {
            name: 'Clicks',
            value: data.click.current,
            change: data.click.change_percent === "new" ? "New" : `${data.click.change_percent}%`,
            trend: data.click.change_percent === "new"
              ? 'up'
              : data.click.change_percent >= 0 ? 'up' : 'down',
            icon: MousePointer,
            color: 'green'
          },
          {
            name: 'Opens',
            value: data.open.current,
            change: data.open.change_percent === "new" ? "New" : `${data.open.change_percent}%`,
            trend: data.open.change_percent === "new"
              ? 'up'
              : data.open.change_percent >= 0 ? 'up' : 'down',
            icon: Eye,
            color: 'purple'
          }
        ];

        setKpiData(formatted);

      } catch (error) {
        console.error("KPI API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadKPI();

  }, [dateFilter, appliedRange]);


  useEffect(() => {
    const loadChartData = async () => {
      try {
        const data = await fetch30DaysTrack();

        const formatted = Object.entries(data).map(([date, values]: any) => {
          const parsedDate = new Date(date);

          return {
            rawDate: parsedDate,
            date: parsedDate.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit"
            }),
            sent: values.sent || 0,
            failed: values.failed || 0,
            spam: values.spam || 0,
            clicks: values.click || 0,
            opens: values.open || 0
          };
        });

        // ✅ FIXED (TypeScript safe)
        formatted.sort(
          (a, b) => a.rawDate.getTime() - b.rawDate.getTime()
        );

        const cleanData = formatted.map(({ rawDate, ...rest }) => rest);

        setChartData(cleanData);

      } catch (error) {
        console.error("Chart API Error:", error);
      } finally {
        setChartLoading(false);
      }
    };

    loadChartData();
  }, []);

  return (
    <div className="dashboard-page space-y-8">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        {/* Left */}
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Overview of your email marketing performance
          </p>
        </div>

        {/* Right - Filter */}
        <div className="flex items-center gap-3 flex-wrap">

        {/* Dropdown */}
        <div className="dashboard-select-wrapper">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="dashboard-select"
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>

          <span className="dashboard-select-arrow">⌄</span>
        </div>

        {/* Custom Range */}
        {dateFilter === "custom" && (
          <div className="dashboard-date-box">
            <input
              type="date"
              value={customRange.start}
              onChange={(e) =>
                setCustomRange({ ...customRange, start: e.target.value })
              }
              className="dashboard-date-input"
            />

            <span className="dashboard-date-divider">—</span>

            <input
              type="date"
              value={customRange.end}
              onChange={(e) =>
                setCustomRange({ ...customRange, end: e.target.value })
              }
              className="dashboard-date-input"
            />

            <button
              onClick={() => {
                if (!customRange.start || !customRange.end) {
                  alert("Please select both dates");
                  return;
                }

                if (customRange.start > customRange.end) {
                  alert("Start date cannot be after end date");
                  return;
                }

                setAppliedRange({ ...customRange });
              }}
              disabled={!customRange.start || !customRange.end}
              className="dashboard-button"
            >
              Apply
            </button>
          </div>
        )}

        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
        {loading ? (
          <div className="col-span-full flex justify-center py-16">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : (
          kpiData.map((kpi) => (
            <div
              key={kpi.name}
              onClick={() => {
                const kpiTypeMap: Record<string, string> = {
                  Opens: "Open",
                  Clicks: "Click",
                  Sent: "Send",
                  Failed: "Failed",
                  Spam: "Spam",
                };

                const type = kpiTypeMap[kpi.name];
                if (!type) return;

                const params = new URLSearchParams({
                  type,
                  filter: dateFilter,
                });

                if (
                  dateFilter === "custom" &&
                  appliedRange?.start &&
                  appliedRange?.end
                ) {
                  params.append("start", appliedRange.start);
                  params.append("end", appliedRange.end);
                }

                navigate(`/kpi?${params.toString()}`);
              }}
              className="dashboard-kpi-card group"
            >
              {/* Glow */}
              <div className="dashboard-kpi-glow" />

              {/* Header */}
              <div className="dashboard-kpi-header">
                <div
                  className={clsx("dashboard-kpi-icon", {
                    "dashboard-blue": kpi.color === "blue",
                    "dashboard-red": kpi.color === "red",
                    "dashboard-orange": kpi.color === "orange",
                    "dashboard-green": kpi.color === "green",
                    "dashboard-purple": kpi.color === "purple",
                  })}
                >
                  <kpi.icon size={26} />
                </div>

                <div
                  className={clsx(
                    "dashboard-kpi-trend",
                    kpi.trend === "up"
                      ? "dashboard-trend-up"
                      : "dashboard-trend-down"
                  )}
                >
                  {kpi.trend === "up" ? (
                    <TrendingUp size={15} />
                  ) : (
                    <TrendingDown size={15} />
                  )}
                  {kpi.change}
                </div>
              </div>

              {/* Body */}
              <div className="dashboard-kpi-body">
                <p className="dashboard-kpi-title">{kpi.name}</p>

                <h2 className="dashboard-kpi-value">
                  {Number(kpi.value).toLocaleString()}
                </h2>

                <p className="dashboard-kpi-footer">
                  Compared with last month
                </p>
              </div>

              {/* Bottom Progress */}
              <div className="dashboard-kpi-progress">
                <span className="dashboard-kpi-progress-fill" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chart Section */}
      <div className="dashboard-card kpi-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold dashboard-text">Performance Overview</h2>
            <p className="dashboard-text-light">Last 30 days performance metrics</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeMetrics).map(([metric, active]) => (
              <button
                key={metric}
                onClick={() => toggleMetric(metric as keyof typeof activeMetrics)}
                className={clsx(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200',
                  active
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-80 relative z-10">
          {chartLoading ? (
            <p>Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                {activeMetrics.sent && (
                  <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                )}
                {activeMetrics.failed && (
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                )}
                {activeMetrics.spam && (
                  <Line type="monotone" dataKey="spam" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                )}
                {activeMetrics.clicks && (
                  <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                )}
                {activeMetrics.opens && (
                  <Line type="monotone" dataKey="opens" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      {/* ✅ Chart container END */}
      {/* Recent Activity */}
      {/* <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center gap-x-3 mb-6">
          <Activity className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-x-4">
                <div className="flex-shrink-0">
                  <div className={clsx(
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    {
                      'bg-green-100 text-green-600': activity.status === 'completed',
                      'bg-blue-100 text-blue-600': activity.status === 'sending',
                      'bg-orange-100 text-orange-600': activity.status === 'scheduled'
                    }
                  )}>
                    <Send className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.campaign}</p>
                  <p className="text-sm text-gray-600">{activity.recipients} recipients • {activity.timestamp}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  {
                    'bg-green-100 text-green-800': activity.status === 'completed',
                    'bg-blue-100 text-blue-800': activity.status === 'sending',
                    'bg-orange-100 text-orange-800': activity.status === 'scheduled'
                  }
                )}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}