import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, MoreHorizontal, Trash2, Eye, Edit, Search, Filter } from "lucide-react";
import { listTemplates, deleteTemplate } from "../../api/recipients";
import "../../styles/templates.css"
/* ================= Types ================= */

interface Template {
    id: number;
    name: string;
    description: string;
    createdAt: string;
}

/* ================= Helpers ================= */

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });


/* ================= Component ================= */

export default function EmailTemplatesPage() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Template | null>(null);
    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    /* ================= Fetch ================= */

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await listTemplates();

            if (!response.status) {
                throw new Error("API failed");
            }

            const mapped = response.data.map((item: any) => ({
                id: item.id,
                name: item.template_name,
                description: item.description,
                createdAt: formatDate(item.created_at),
            }));

            setTemplates(mapped);
            setFilteredTemplates(mapped);
        } catch (err) {
            console.error("Failed to load templates", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    /* ================= Search ================= */

    useEffect(() => {
        const filtered = templates.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredTemplates(filtered);
    }, [search, templates]);

    /* ================= Handlers ================= */

    const slugify = (text: string) =>
        text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");


    const openEdit = (t: Template) => {
        const slug = slugify(t.name);
        navigate(`/codespace/${slug}`);
    };

    const openView = (t: Template) => {
        const slug = slugify(t.name);
        navigate(`/template-view/${slug}`);
    };

    const saveTemplate = async () => {
        if (saving) return;
        setSaving(true);

        try {
        if (!name.trim()) {
            alert("Template name is required");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());

        if (!editing) {
            if (!file) {
            alert("File is required");
            return;
            }
            formData.append("file", file);
            // await createTemplate();
        } else {
            // await updateTemplate(editing.id );
        }

        await fetchTemplates();

        setShowModal(false);
        setEditing(null);
        setName("");
        setFile(null);
        } catch (err) {
        console.error("Save failed", err);
        alert("Failed to save template");
        } finally {
        setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this template?")) return;

        try {
            await deleteTemplate(id);
            await fetchTemplates(); // refresh list
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete template");
        }
    };


    /* ================= UI ================= */

    return (
        <div className="space-y-8">

            {/* ===== Header ===== */}
            <div className="templates-page-header">

                <div className="templates-header">

                    <div className="templates-header-content">

                        <h1 className="templates-title">
                            Email Templates
                        </h1>

                        <p className="templates-subtitle">
                            Create and manage reusable email templates.
                        </p>

                    </div>

                    <button
                        onClick={() => navigate("/codespace")}
                        className="templates-add-btn"
                    >
                        <Plus size={18} />
                        Create Template
                    </button>

                </div>


                {/* ================= FILTER CARD ================= */}

                <div className="templates-filter-card">

                    <div className="templates-toolbar">

                        <div className="templates-search templates-toolbar-search">

                            <Search size={18} />

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search templates..."
                                className="templates-input"
                            />

                        </div>

                        <div className="templates-toolbar-actions">

                            <button className="templates-btn templates-btn-outline">

                                <Filter size={16} />

                                Filter

                            </button>

                        </div>

                    </div>

                </div>

            </div>

            {/* ===== Cards ===== */}

            {loading ? (
                <div className="template-loading-card">
                    Loading templates...
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="template-empty-card">

                    <FileText className="template-empty-icon" />

                    <h3>No templates yet</h3>

                    <p>Create templates to reuse in your campaigns.</p>

                </div>
            ) : (

            <div className="template-grid">

                {filteredTemplates.map((t) => (

                    <div
                        key={t.id}
                        className="template-card"
                    >

                        {/* Header */}

                        <div className="template-card-header">

                            <div className="template-card-info">

                                <div className="template-icon">
                                    <FileText size={22} />
                                </div>

                                <div className="template-content">

                                    <h3>{t.name}</h3>

                                    <p className="template-description">
                                        {t.description}
                                    </p>

                                    <span className="template-meta">
                                        Added {t.createdAt}
                                    </span>

                                </div>

                            </div>

                            <div className="template-menu">

                                <button className="template-menu-btn">
                                    <MoreHorizontal size={18} />
                                </button>

                            </div>

                        </div>

                        {/* Actions */}

                        <div className="template-actions">

                            <button
                                onClick={() => openView(t)}
                                className="template-btn template-btn-outline"
                            >
                                <Eye size={16} />
                                View
                            </button>

                            <button
                                onClick={() => openEdit(t)}
                                className="template-btn template-btn-outline"
                            >
                                <Edit size={16} />
                                Edit
                            </button>

                            <button
                                onClick={() => handleDelete(t.id)}
                                className="template-btn template-btn-danger"
                            >
                                <Trash2 size={16} />
                            </button>

                        </div>

                    </div>

                ))}

            </div>

            )}
            {/* ===== Modal ===== */}
            {showModal && (
                <div className="template-modal-overlay">

                    <div className="template-modal">

                        <div className="template-modal-header">

                            <div>

                                <h2>
                                    {editing ? "Edit Template" : "Create Template"}
                                </h2>

                                <p>
                                    {editing
                                        ? "Update your email template."
                                        : "Upload a reusable email template."}
                                </p>

                            </div>

                            <button
                                className="template-close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>

                        </div>

                        <div className="template-modal-body">

                            <div className="template-field">

                                <label>Template Name</label>

                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Newsletter Template"
                                    className="template-input"
                                />

                            </div>

                            {!editing && (

                                <div className="template-upload">

                                    <label>Upload HTML File</label>

                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            setFile(e.target.files?.[0] || null)
                                        }
                                    />

                                </div>

                            )}

                        </div>

                        <div className="template-modal-footer">

                            <button
                                className="template-btn template-btn-outline"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="template-save-btn"
                                onClick={saveTemplate}
                            >
                                {saving ? "Saving..." : editing ? "Update Template" : "Create Template"}
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}