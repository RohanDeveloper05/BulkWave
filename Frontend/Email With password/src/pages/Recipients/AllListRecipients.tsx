import { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import clsx from 'clsx';
import { fetchAllMergedEmails } from "../../api/recipients";

interface Props {
    isActive: boolean;
}

export default function AllListRecipients({ isActive }: Props) {
    const [allEmailRows, setAllEmailRows] = useState<any[]>([]);
    const [allEmailNext, setAllEmailNext] = useState<number | null>(1);
    const [allEmailLoading, setAllEmailLoading] = useState(false);
    const [searchTerm] = useState('');

    const [allEmailFilters, setAllEmailFilters] = useState({
        search: "",
        subscribers: "",
        min_lists: "",
        list_names: ""
    });

    const tagColors = [
        "recipient-tag-blue",
        "recipient-tag-green",
        "recipient-tag-purple",
        "recipient-tag-amber",
        "recipient-tag-pink",
    ];

    const loadAllEmails = async (page = 1, reset = false) => {
        try {
        if (allEmailLoading) return;
        setAllEmailLoading(true);

        const data = await fetchAllMergedEmails({
            page,
            page_size: 30,
            search: allEmailFilters.search,
            subscribers: allEmailFilters.subscribers,
            min_lists: allEmailFilters.min_lists ? Number(allEmailFilters.min_lists) : undefined,
            list_names: allEmailFilters.list_names,
        });

        if (reset) {
            setAllEmailRows(data.results || []);
        } else {
            setAllEmailRows(prev => [...prev, ...(data.results || [])]);
        }
        setAllEmailNext(data.pagination?.has_next ? page + 1 : null);
        } catch (err) {
        console.error(err);
        } finally {
        setAllEmailLoading(false);
        }
    };

    useEffect(() => {
        if (isActive) {
        setAllEmailRows([]);
        setAllEmailNext(1);
        loadAllEmails(1, true);
        }
    }, [isActive]);

    useEffect(() => {
        if (!isActive) return;
        const delay = setTimeout(() => {
        setAllEmailRows([]);
        setAllEmailNext(1);
        loadAllEmails(1, true);
        }, 400);
        return () => clearTimeout(delay);
    }, [allEmailFilters]);

    useEffect(() => {
        if (!isActive) return;
        const container = document.getElementById('all-email-scroll');
        if (!container) return;

        const handleScroll = () => {
        const nearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
        if (nearBottom && allEmailNext && !allEmailLoading) {
            loadAllEmails(allEmailNext);
        }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [isActive, allEmailNext, allEmailLoading]);

    const filteredAllEmails = allEmailRows.filter(row =>
        `${row.First_Name} ${row.Last_Name} ${row.Email_id}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
        {/* Filters */}
        <div className="recipient-filter-card">
            <div className="recipient-filter-grid">

                <div className="recipient-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search recipients..."
                        value={allEmailFilters.search}
                        onChange={(e) =>
                            setAllEmailFilters(prev => ({
                                ...prev,
                                search: e.target.value
                            }))
                        }
                        className="recipient-input"
                    />
                </div>

                <select
                    value={allEmailFilters.subscribers}
                    onChange={(e) =>
                        setAllEmailFilters(prev => ({
                            ...prev,
                            subscribers: e.target.value
                        }))
                    }
                    className="recipient-select"
                >
                    <option value="">All Users</option>
                    <option value="subscribed">Subscribed</option>
                    <option value="unsubscribed">Unsubscribed</option>
                </select>

                <input
                    type="number"
                    placeholder="Minimum Lists"
                    value={allEmailFilters.min_lists}
                    onChange={(e) =>
                        setAllEmailFilters(prev => ({
                            ...prev,
                            min_lists: e.target.value
                        }))
                    }
                    className="recipient-input"
                />

                <input
                    type="text"
                    placeholder="List Name"
                    value={allEmailFilters.list_names}
                    onChange={(e) =>
                        setAllEmailFilters(prev => ({
                            ...prev,
                            list_names: e.target.value
                        }))
                    }
                    className="recipient-input"
                />

                <button
                    className="recipient-btn"
                    onClick={() =>
                        setAllEmailFilters({
                            search: "",
                            subscribers: "",
                            min_lists: "",
                            list_names: ""
                        })
                    }
                >
                    Reset
                </button>

            </div>
        </div>

        {/* Table */}
        <div className="recipient-table-card">
            <div id="all-email-scroll" className="custom-scrollbar overflow-x-auto overflow-y-auto max-h-[500px] scroll-smooth">
                <table className="recipient-table">
                    <thead>
                        <tr>
                            <th>S No.</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Company</th>
                            <th>Location</th>
                            <th className="text-center">Lists</th>
                            <th className="text-center">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredAllEmails.map((row: any, index: number) => (
                            <tr key={index}>
                                <td>{index + 1}</td>

                                <td>
                                    <div className="recipient-name">
                                        <div className="recipient-avatar">
                                            {(row.First_Name?.[0] || "")}
                                            {(row.Last_Name?.[0] || "")}
                                        </div>

                                        <div>
                                            <div className="recipient-primary">
                                                {row.First_Name} {row.Last_Name}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <div className="recipient-primary">
                                        <div className="flex items-center gap-2">
                                            <span>{row.Email_id && row.Email_id.trim() !== '' ? row.Email_id : 'N/A'}</span>
                                            {row.Email_id && row.Email_id.trim() !== '' && <Star className="h-4 w-4 text-yellow-500" />}
                                        </div>
                                    </div>

                                    {row.Email_id_01 && (
                                        <div className="recipient-secondary">
                                            {row.Email_id_01}
                                        </div>
                                    )}

                                    {row.Email_id_02 && (
                                        <div className="recipient-secondary">
                                            {row.Email_id_02}
                                        </div>
                                    )}
                                </td>

                                <td>
                                    <div className="recipient-primary">
                                        <div className="flex items-center gap-2">
                                            <span>{row.Mobile && row.Mobile.toString().trim() !== '' ? row.Mobile : 'N/A'}</span>
                                            {row.Mobile && row.Mobile.toString().trim() !== '' && <Star className="h-4 w-4 text-yellow-500" />}
                                        </div>
                                    </div>

                                    {row.Mobile_01 && (
                                        <div className="recipient-secondary">
                                            {row.Mobile_01}
                                        </div>
                                    )}

                                    {row.Mobile_02 && (
                                        <div className="recipient-secondary">
                                            {row.Mobile_02}
                                        </div>
                                    )}
                                </td>

                                <td>{row.Company_Name || "-"}</td>

                                <td>
                                    <div>{row.City}, {row.State}</div>
                                    <div className="recipient-secondary">
                                        {row.Locality}
                                    </div>
                                </td>

                                <td>
                                    <div className="recipient-tag-group">
                                        {row.list_names?.map((list: string, i: number) => (
                                            <span
                                                key={i}
                                                className={`recipient-tag ${tagColors[i % tagColors.length]}`}
                                            >
                                                {list}
                                            </span>
                                        ))}
                                    </div>
                                </td>

                                <td>
                                    <span
                                        className={clsx(
                                            "recipient-status",
                                            row.Unsubscribe === 1 ? "inactive" : "active"
                                        )}
                                    >
                                        {row.Unsubscribe === 1
                                            ? "Unsubscribed"
                                            : "Subscribed"}
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {allEmailLoading && (
                            <tr>
                                <td colSpan={8} className="recipient-loading">
                                    Loading more data...
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