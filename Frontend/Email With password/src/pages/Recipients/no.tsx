import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import clsx from 'clsx';
import { fetchEmailCampaignRecipients } from "../../api/recipients";

export default function RecipientsLogs() {
    const [emailRows, setEmailRows] = useState<any[]>([]);
    const [emailNext, setEmailNext] = useState<string | null>(null);
    const [emailLoading, setEmailLoading] = useState(false);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: "",
        status: [] as string[],
        min_emails: "",
        date_filter: "",
        start_date: "",
        end_date: "",
        ordering: "-created_at",
        from_email: "",
    });

    const statusColors: any = {
        completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        scheduled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        sending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        pending: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };

    const loadData = async (page = 1, reset = false) => {
        try {
        setEmailLoading(true);
        const data = await fetchEmailCampaignRecipients({
            search: filters.search,
            status: filters.status,
            min_emails: filters.min_emails ? Number(filters.min_emails) : undefined,
            date_filter: filters.date_filter,
            start_date: filters.start_date,
            end_date: filters.end_date,
            ordering: filters.ordering,
            page: page,
            from_email: filters.from_email,
        });

        if (reset) {
            setEmailRows(Array.isArray(data.results) ? data.results : []);
        } else {
            setEmailRows(prev => [...prev, ...(data.results || [])]);
        }
        setEmailNext(data.next);
        } catch (err) {
        console.error(err);
        } finally {
        setEmailLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
        loadData(1, true);
        }, 400);
        return () => clearTimeout(delay);
    }, [filters]);

    useEffect(() => {
        const container = document.getElementById('email-table-scroll');
        if (!container) return;

        const handleScroll = () => {
        const nearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
        if (nearBottom && emailNext && !emailLoading) {
            loadData(Number(new URL(emailNext).searchParams.get("page")), false);
        }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [emailNext, emailLoading, filters]);

    return (
        <div className="space-y-6">
        {/* Filters */}
        <div className="recipient-filter-card">
            {showMoreFilters && (
                <div className="recipient-advanced-filters">
                    <div className="recipient-advanced-header">
                        <h4>Advanced Filters</h4>
                        <span>Filter email logs</span>
                    </div>

                    <div className="recipient-advanced-grid">

                        <input
                            type="text"
                            placeholder="From Email"
                            value={filters.from_email}
                            onChange={(e) =>
                                setFilters(prev => ({ ...prev, from_email: e.target.value }))
                            }
                            className="recipient-input recipient-input-sm"
                        />

                        <input
                            type="number"
                            placeholder="Min Emails"
                            value={filters.min_emails}
                            onChange={(e) =>
                                setFilters(prev => ({ ...prev, min_emails: e.target.value }))
                            }
                            className="recipient-input recipient-input-sm"
                        />

                        <select
                            value={filters.date_filter}
                            onChange={(e) =>
                                setFilters(prev => ({ ...prev, date_filter: e.target.value }))
                            }
                            className="recipient-select recipient-input-sm"
                        >
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="last_7_days">Last 7 Days</option>
                            <option value="last_30_days">Last 30 Days</option>
                        </select>

                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) =>
                                setFilters(prev => ({ ...prev, start_date: e.target.value }))
                            }
                            className="recipient-input recipient-input-sm"
                        />

                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) =>
                                setFilters(prev => ({ ...prev, end_date: e.target.value }))
                            }
                            className="recipient-input recipient-input-sm"
                        />

                        <select
                            value={filters.ordering}
                            onChange={(e) =>
                                setFilters(prev => ({ ...prev, ordering: e.target.value }))
                            }
                            className="recipient-select recipient-input-sm"
                        >
                            <option value="-created_at">Newest First</option>
                            <option value="created_at">Oldest First</option>
                            <option value="-total_emails">Max Emails</option>
                            <option value="total_emails">Min Emails</option>
                        </select>

                    </div>

                    <div className="recipient-advanced-footer">
                        <button
                            className="recipient-btn"
                            onClick={() =>
                                setFilters({
                                    search: "",
                                    status: [],
                                    min_emails: "",
                                    date_filter: "",
                                    start_date: "",
                                    end_date: "",
                                    ordering: "-created_at",
                                    from_email: "",
                                })
                            }
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            )}

            <div className="recipient-toolbar">

                <div className="recipient-search recipient-toolbar-search">
                    <Search className="h-4 w-4" />

                    <input
                        type="text"
                        placeholder="Search by subject..."
                        value={filters.search}
                        onChange={(e) =>
                            setFilters(prev => ({
                                ...prev,
                                search: e.target.value
                            }))
                        }
                        className="recipient-input"
                    />
                </div>

                <div className="recipient-toolbar-actions">

                    <select
                        value={filters.status[0] || "all"}
                        onChange={(e) => {
                            const value = e.target.value;

                            setFilters(prev => ({
                                ...prev,
                                status: value === "all" ? [] : [value]
                            }));
                        }}
                        className="recipient-select"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="sending">Sending</option>
                        <option value="pending">Pending</option>
                    </select>

                    <button
                        type="button"
                        onClick={() => setShowMoreFilters(!showMoreFilters)}
                        className={`recipient-btn recipient-btn-outline ${
                            showMoreFilters ? "recipient-btn-active" : ""
                        }`}
                    >
                        <Filter size={16} />

                        {showMoreFilters ? "Hide Filters" : "More Filters"}

                        <span className="recipient-filter-count">
                            6
                        </span>
                    </button>

                </div>

            </div>
        </div>

        {/* Table */}
        <div className="recipient-table-card">
            <div
                id="email-table-scroll"
                className="custom-scrollbar overflow-x-auto overflow-y-auto max-h-[500px] scroll-smooth"
            >
                <table className="recipient-table">
                    <thead>
                        <tr>
                            <th>S No.</th>
                            <th>Date</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Recipients</th>
                            <th>From Email</th>
                            <th className="text-center">About Email</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emailRows.map((row, index) => (
                            <tr key={index}>
                                {/* S.No */}
                                <td>{index + 1}</td>

                                {/* Date */}
                                <td>
                                    <div className="recipient-primary">
                                        {row.created_at
                                            ? new Date(row.created_at).toLocaleDateString("en-US")
                                            : "-"}
                                    </div>

                                    {row.created_at && (
                                        <div className="recipient-secondary">
                                            {new Date(row.created_at).toLocaleTimeString("en-US", {
                                                hour: "numeric",
                                                minute: "2-digit",
                                                second: "2-digit",
                                                hour12: true,
                                            })}
                                        </div>
                                    )}
                                </td>

                                {/* Subject */}
                                <td>
                                    <div className="recipient-name">
                                        <div className="recipient-avatar">
                                            {(row.subject?.[0] || "E").toUpperCase()}
                                        </div>

                                        <div>
                                            <div className="recipient-primary">
                                                {row.subject}
                                            </div>

                                            <div className="recipient-secondary">
                                                Email Campaign
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Status */}
                                <td>
                                    <span className={clsx('inline-flex px-2 py-1 text-xs font-semibold rounded-full', statusColors[row.status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300")}>
                                    {row.status}
                                    </span>
                                </td>

                                {/* Recipients */}
                                <td>
                                    <div className="recipient-primary">
                                        {row.recipients_email
                                            ? row.recipients_email
                                                .replace(/[\[\]']/g, "")
                                                .split(",")
                                                .slice(0, 2)
                                                .join(", ")
                                            : "-"}
                                    </div>

                                    {row.recipients_email &&
                                        row.recipients_email.split(",").length > 2 && (
                                            <div className="recipient-secondary">
                                                +{row.recipients_email.split(",").length - 2} more
                                            </div>
                                        )}
                                </td>

                                {/* From Email */}
                                <td>
                                    <div className="recipient-primary">
                                        {row.from_email?.split("@")[0]}
                                    </div>

                                    <div className="recipient-secondary">
                                        {row.from_email}
                                    </div>
                                </td>

                                {/* About */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-wrap justify-center gap-1">
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                                        {row.recipient_type}
                                    </span>
                                    {row.list_name && (
                                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded">
                                        {row.list_name}
                                        </span>
                                    )}
                                    {row.uploaded_file && (
                                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded">
                                        file
                                        </span>
                                    )}
                                    </div>
                                </td>

                                {/* Total */}
                                <td>
                                    <div className="recipient-primary">
                                        {row.total_emails?.toLocaleString() || 0}
                                    </div>

                                    <div className="recipient-secondary">
                                        emails sent
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {emailLoading && (
                            <tr>
                                <td colSpan={8} className="recipient-loading">
                                    Loading more emails...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
}