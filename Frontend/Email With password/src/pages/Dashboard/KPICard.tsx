import { useEffect, useState } from "react";
import { Eye, MousePointer, Send, AlertTriangle, Shield } from "lucide-react";

import clsx from "clsx";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { fetchOneKPIData } from "../../api/recipients";
import "../../styles/Dashboard.css";

type KPIItem = {
    recipient: string;
    event_type: string;
    source: string | null;
    subject: string | null;
    timestamp: string;
};

const iconMap: any = {
    Open: Eye,
    Click: MousePointer,
    Send: Send,
    Failed: AlertTriangle,
    Spam: Shield
};

const colorMap: any = {
    Open: "purple",
    Click: "green",
    Send: "blue",
    Failed: "red",
    Spam: "orange"
};

export default function KPICard() {

    const location = useLocation();
    const navigate = useNavigate();
    const [showFilters, setShowFilters] = useState(false);
    
    const [customRange, setCustomRange] = useState({
        start: "",
        end: "",
    });

    
    const getParams = () => {
        const params = new URLSearchParams(location.search);
        
        return {
            type: params.get("type") || "Open",
            filter: params.get("filter") || "this_month",
            startDate: params.get("start") || "",
            endDate: params.get("end") || "",
        };
    };
    
    const [dateFilter, setDateFilter] = useState(getParams().filter);
    const [{ type, filter, startDate, endDate }, setQuery] = useState(getParams());

    useEffect(() => {
        setQuery(getParams());
    }, [location.search]);

    const [data, setData] = useState<KPIItem[]>([]);
    const [count, setCount] = useState(0);


    const [loading, setLoading] = useState(false);
    // const [loadingMore, setLoadingMore] = useState(false);

    // ✅ Pagination
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    // ✅ Search
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        fetchKPI(page);
    }, [page, type, filter, startDate, endDate, debouncedSearch]);

    useEffect(() => {
        if (filter === "custom") {
            setCustomRange({
                start: startDate,
                end: endDate,
            });
        }
    }, [filter, startDate, endDate]);

    useEffect(() => {

        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);

    }, [search]);

    useEffect(() => {
        setDateFilter(filter);
    }, [filter]);

    // =========================
    // Sync URL Type
    // =========================

    useEffect(() => {
        setQuery(getParams());
    }, [location.search]);

    // =========================
    // Fetch KPI Data
    // =========================

    const fetchKPI = async (pageNumber = 1) => {
        try {
            setLoading(true);

            const res = await fetchOneKPIData({
                type,
                filter,
                start_date: startDate,
                end_date: endDate,
                search: debouncedSearch,
                page: pageNumber,
            });

            setData(res.results?.data || []);
            setCount(res.count || 0);

            setHasNext(!!res.next);

            const PAGE_SIZE = 10;

            setTotalPages(
                Math.max(
                    1,
                    Math.ceil((res.count || 0) / PAGE_SIZE)
                )
            );

        } catch (err) {
            console.error("KPI Card Error:", err);
        } finally {
            setLoading(false);
        }
    };


    // =========================
    // Reset & Fetch
    // =========================

    useEffect(() => {
        setPage(1);
    }, [type, filter, startDate, endDate, debouncedSearch]);

    useEffect(() => {
        fetchKPI(page);
    }, [page, type, filter, startDate, endDate, debouncedSearch]);


    const Icon = iconMap[type];

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">

                <div>
                    <h1 className="dashboard-title">
                        {type} KPI Details
                    </h1>
                </div>

                <div className="flex items-center gap-3">

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="kpi-btn kpi-btn-outline"
                    >
                        ← Dashboard
                    </button>

                </div>
            </div>

            {/* KPI Summary */}
            <div className="kpi-summary-card">

                <div className="kpi-summary-content">

                    <span className="kpi-summary-label">
                        {type} Events
                    </span>

                    <h2 className="kpi-summary-value">
                        {loading ? "..." : count}
                    </h2>

                </div>

                <div
                    className={clsx(
                        "kpi-summary-icon",
                        {
                            "kpi-blue": colorMap[type] === "blue",
                            "kpi-red": colorMap[type] === "red",
                            "kpi-orange": colorMap[type] === "orange",
                            "kpi-green": colorMap[type] === "green",
                            "kpi-purple": colorMap[type] === "purple",
                        }
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>

            </div>

            {/* ==========================================
                FILTER CARD
            ========================================== */}
            <div className="kpi-filter-card">

                {/* Toolbar */}
                <div className="kpi-toolbar">

                    {/* Search */}
                    <div className="kpi-search kpi-toolbar-search">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search recipient email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="kpi-input"
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="kpi-toolbar-actions">

                        <select
                            value={type}
                            onChange={(e) =>
                                navigate(`/kpi?type=${e.target.value}&filter=${filter}`)
                            }
                            className="kpi-select"
                        >
                            <option value="Open">Open</option>
                            <option value="Click">Click</option>
                            <option value="Send">Send</option>
                            <option value="Failed">Failed</option>
                            <option value="Spam">Spam</option>
                        </select>

                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`kpi-btn kpi-btn-outline ${
                                showFilters ? "kpi-btn-active" : ""
                            }`}
                        >
                            <Filter size={16} />

                            {showFilters ? "Hide Filters" : "More Filters"}

                            <span className="kpi-filter-count">
                                {filter === "custom" ? 2 : 1}
                            </span>
                        </button>

                    </div>

                </div>

                {/* ==========================================
                    ADVANCED FILTERS
                ========================================== */}

                {showFilters && (
                    <div className="kpi-advanced-filters">

                        <div className="kpi-advanced-header">
                            <h4>Advanced Filters</h4>
                            <span>
                                Narrow down KPI records using the filters below.
                            </span>
                        </div>

                        <div className="kpi-advanced-grid">

                            {/* KPI Type */}

                            <div className="kpi-filter-group">

                                <label>KPI Type</label>

                                <select
                                    value={type}
                                    onChange={(e) =>
                                        navigate(`/kpi?type=${e.target.value}&filter=${filter}`)
                                    }
                                    className="kpi-select"
                                >
                                    <option value="Open">Open</option>
                                    <option value="Click">Click</option>
                                    <option value="Send">Send</option>
                                    <option value="Failed">Failed</option>
                                    <option value="Spam">Spam</option>
                                </select>

                            </div>

                            {/* Date Filter */}

                            <div className="kpi-filter-group">

                                <label>Date Range</label>

                                <select
                                    value={filter}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        setDateFilter(value);

                                        if (value !== "custom") {
                                            navigate(
                                                `/kpi?type=${type}&filter=${value}`
                                            );
                                        }
                                    }}
                                    className="kpi-select"
                                >
                                    <option value="this_month">
                                        This Month
                                    </option>

                                    <option value="last_month">
                                        Last Month
                                    </option>

                                    <option value="last_30_days">
                                        Last 30 Days
                                    </option>

                                    <option value="custom">
                                        Custom Range
                                    </option>

                                </select>

                            </div>

                        </div>

                        {/* ==========================================
                            CUSTOM DATE RANGE
                        ========================================== */}

                        {dateFilter === "custom" && (

                            <div className="kpi-custom-card">

                                <div className="kpi-filter-group">

                                    <label>Start Date</label>

                                    <input
                                        type="date"
                                        value={customRange.start}
                                        onChange={(e) =>
                                            setCustomRange({
                                                ...customRange,
                                                start: e.target.value,
                                            })
                                        }
                                        className="kpi-input"
                                    />

                                </div>

                                <div className="kpi-filter-group">

                                    <label>End Date</label>

                                    <input
                                        type="date"
                                        value={customRange.end}
                                        onChange={(e) =>
                                            setCustomRange({
                                                ...customRange,
                                                end: e.target.value,
                                            })
                                        }
                                        className="kpi-input"
                                    />

                                </div>

                                <button
                                    type="button"
                                    className="kpi-btn kpi-btn-primary"
                                    disabled={
                                        !customRange.start ||
                                        !customRange.end
                                    }
                                    onClick={() => {

                                        if (
                                            !customRange.start ||
                                            !customRange.end
                                        ) {
                                            alert(
                                                "Please select both dates."
                                            );
                                            return;
                                        }

                                        if (
                                            customRange.start >
                                            customRange.end
                                        ) {
                                            alert(
                                                "Start date cannot be after End date."
                                            );
                                            return;
                                        }

                                        navigate(
                                            `/kpi?type=${type}&filter=custom&start=${customRange.start}&end=${customRange.end}`
                                        );

                                    }}
                                >
                                    Apply Filter
                                </button>

                            </div>

                        )}

                    </div>
                )}

            </div>

            {/* Table */}
            <div className="recipient-table-card">

                <div
                    className="custom-scrollbar overflow-x-auto overflow-y-auto max-h-[600px] scroll-smooth"
                >

                    <table className="recipient-table">

                        <thead>

                            <tr>

                                <th>S No.</th>

                                <th>Date</th>

                                <th>Subject</th>

                                <th>Event</th>

                                <th>Recipient</th>

                                <th>Source</th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>
                                    <td colSpan={6} className="recipient-loading">
                                        Loading KPI records...
                                    </td>
                                </tr>

                            ) : data.length === 0 ? (

                                <tr>
                                    <td colSpan={6} className="recipient-loading">
                                        No data found
                                    </td>
                                </tr>

                            ) : (

                                data.map((item, index) => (

                                    <tr key={index}>

                                        {/* S.No */}

                                        <td>
                                            {(page - 1) * 10 + index + 1}
                                        </td>

                                        {/* Date */}

                                        <td>

                                            <div className="recipient-primary">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </div>

                                            <div className="recipient-secondary">
                                                {new Date(item.timestamp).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                })}
                                            </div>

                                        </td>

                                        {/* Subject */}

                                        <td>

                                            <div className="recipient-name">

                                                <div className="recipient-avatar">
                                                    {(item.subject?.[0] || "E").toUpperCase()}
                                                </div>

                                                <div>

                                                    <div className="recipient-primary">
                                                        {item.subject || "-"}
                                                    </div>

                                                    <div className="recipient-secondary">
                                                        Email Campaign
                                                    </div>

                                                </div>

                                            </div>

                                        </td>

                                        {/* Event */}

                                        <td>

                                            <span
                                                className={clsx(
                                                    "status-badge",
                                                    {
                                                        Open: "status-open",
                                                        Click: "status-click",
                                                        Send: "status-send",
                                                        Failed: "status-failed",
                                                        Spam: "status-spam",
                                                    }[item.event_type] || "status-open"
                                                )}
                                            >
                                                {item.event_type}
                                            </span>

                                        </td>

                                        {/* Recipient */}

                                        <td>

                                            <div className="recipient-primary">
                                                {item.recipient}
                                            </div>

                                            <div className="recipient-secondary">
                                                Email Recipient
                                            </div>

                                        </td>

                                        {/* Source */}

                                        <td>

                                            <div className="recipient-primary">
                                                {item.source || "-"}
                                            </div>

                                            <div className="recipient-secondary">
                                                Tracking Source
                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

                {/* Pagination */}

                <div className="recipient-pagination">

                    <span className="recipient-page-info">
                        Page {page} of {totalPages}
                    </span>

                    <div className="recipient-pagination-actions">

                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="recipient-page-btn"
                        >
                            ←
                        </button>

                        <button
                            disabled={!hasNext}
                            onClick={() => setPage((p) => p + 1)}
                            className="recipient-page-btn"
                        >
                            →
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}
