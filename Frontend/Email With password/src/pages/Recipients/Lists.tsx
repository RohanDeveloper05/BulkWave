import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { downloadListCSV } from "../../api/recipients";
import { List } from './Recipients';

interface Props {
    lists: List[];
    listsLoading: boolean;
    setEditList: (list: List) => void;
    handleDeleteList: (id: number) => void;
}

export default function Lists({ lists, listsLoading, setEditList, handleDeleteList }: Props) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const filteredLists = lists.filter((list) => {
        const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (list.description || "").toLowerCase().includes(searchTerm.toLowerCase());
        if (selectedFilter === "all") return matchesSearch;
        if (selectedFilter === "large") return matchesSearch && list.recipientCount > 1000;
        if (selectedFilter === "small") return matchesSearch && list.recipientCount <= 1000;
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
        {/* Filters */}
        <div className="recipient-filter-card">

            {/* Advanced Filters */}
            {showMoreFilters && (
                <div className="recipient-advanced-filters">

                    <div className="recipient-advanced-header">
                        <h4>Advanced Filters</h4>
                        <span>Filter your contact lists</span>
                    </div>

                    <div className="recipient-advanced-grid">

                        <input
                            type="number"
                            placeholder="Minimum Contacts"
                            className="recipient-input recipient-input-sm"
                        />

                        <input
                            type="number"
                            placeholder="Maximum Contacts"
                            className="recipient-input recipient-input-sm"
                        />

                        <select className="recipient-select recipient-input-sm">
                            <option value="">Created Date</option>
                            <option value="today">Today</option>
                            <option value="last_7_days">Last 7 Days</option>
                            <option value="last_30_days">Last 30 Days</option>
                        </select>

                        <input
                            type="date"
                            className="recipient-input recipient-input-sm"
                        />

                        <input
                            type="date"
                            className="recipient-input recipient-input-sm"
                        />

                    </div>

                    <div className="recipient-advanced-footer">
                        <button
                            className="recipient-btn"
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedFilter("all");
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>

                </div>
            )}

            {/* Toolbar */}
            <div className="recipient-toolbar">

                <div className="recipient-search recipient-toolbar-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search lists..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="recipient-input"
                    />
                </div>

                <div className="recipient-toolbar-actions">

                    <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="recipient-select"
                    >
                        <option value="all">All Lists</option>
                        <option value="large">Large (&gt;1000)</option>
                        <option value="small">Small (≤1000)</option>
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
                            5
                        </span>

                    </button>

                </div>

            </div>

        </div>

        {/* Content */}
        {listsLoading ? (
            <div className="list-loading-card">
                Loading lists...
            </div>
        ) : filteredLists.length === 0 ? (
            <div className="list-empty-card">
                <FileText className="list-empty-icon" />

                <h3>No matching lists</h3>

                <p>Try adjusting your search or filters.</p>
            </div>
        ) : (
            <div className="list-grid">

                {filteredLists.map((list) => (

                    <div key={list.id} className="list-card">

                        <div className="list-card-header">

                            <div className="list-card-info">

                                <div className="list-icon">
                                    <FileText size={24} />
                                </div>

                                <div className="list-content">

                                    <h3>{list.name}</h3>

                                    <p className="list-description">
                                        {list.description}
                                    </p>

                                    <span className="list-meta">
                                        {list.recipientCount.toLocaleString()} recipients • Added {list.createdAt}
                                    </span>

                                </div>

                            </div>

                            <div className="list-menu">

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(openMenuId === list.id ? null : list.id);
                                    }}
                                    className="list-menu-btn"
                                >
                                    <MoreHorizontal size={18} />
                                </button>

                                {openMenuId === list.id && (
                                    <div
                                        className="list-dropdown"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => {
                                                downloadListCSV(list.id);
                                                setOpenMenuId(null);
                                            }}
                                        >
                                            Download CSV
                                        </button>
                                    </div>
                                )}

                            </div>

                        </div>

                        <div className="list-actions">

                            <button
                                onClick={() => navigate(`/lists/${list.id}`)}
                                className="list-btn list-btn-outline"
                            >
                                View
                            </button>

                            <button
                                onClick={() => setEditList(list)}
                                className="list-btn list-btn-outline"
                            >
                                Edit
                            </button>

                            <button
                                onClick={() => handleDeleteList(list.id)}
                                className="list-btn list-btn-danger"
                            >
                                <Trash2 size={16} />
                            </button>

                        </div>

                    </div>

                ))}

            </div>
        )}
        </div>
    );
}