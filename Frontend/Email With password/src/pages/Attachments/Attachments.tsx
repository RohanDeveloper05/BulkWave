import { useEffect, useState } from "react";
import { Plus, FileText, MoreHorizontal, Trash2, Eye, Edit, Upload, CheckCircle, Search, Filter } from "lucide-react";
import { createAttachment, updateAttachment, listAttachments, deleteAttachment as deleteAttachmentAPI } from "../../api/recipients";
import "../../styles/Attachments.css"

/* ================= Types ================= */

interface Attachment {
    id: number;
    name: string;
    fileName: string;
    size: string;
    createdAt: string;
}

/* ================= Helpers ================= */

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

const formatSize = (bytes?: number) => {
    if (!bytes) return "—";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
};

const getFileName = (path?: string) =>
    path ? path.split("/").pop() || "—" : "—";


/* ================= Component ================= */

export default function AttachmentsPage() {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Attachment | null>(null);
    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const [filteredAttachments, setFilteredAttachments] = useState<Attachment[]>([]);
    const [search, setSearch] = useState("");

    /* ================= Fetch Attachments ================= */

    const fetchAttachments = async () => {
        setLoading(true);
        try {
            const response = await listAttachments();

            const mappedData = response.results.map((item: any) => ({
                id: item.id,
                name: item.file_name,
                fileName: getFileName(item.uploaded_file),
                size: formatSize(item.size),
                createdAt: formatDate(item.created_at),
            }));

            setAttachments(mappedData);
            setFilteredAttachments(mappedData);

        } catch (err) {
            console.error("Failed to load attachments", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttachments();
    }, []);

    /* ================= Handlers ================= */

    const openAdd = () => {
        setEditing(null);
        setName("");
        setFile(null);
        setShowModal(true);
    };

    const openEdit = (att: Attachment) => {
        setEditing(att);
        setName(att.name);
        setShowModal(true);
    };

    const saveAttachment = async () => {
        if (saving) return;
        setSaving(true);

        try {
            if (!name.trim()) {
            alert("Attachment name is required");
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
            await createAttachment(formData);
            } else {
            await updateAttachment(editing.id, formData);
            }

            // ✅ Refresh attachments list
            await fetchAttachments();

            // reset modal
            setShowModal(false);
            setEditing(null);
            setName("");
            setFile(null);

        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save attachment");
        } finally {
            setSaving(false);
        }
    };

    /* ================= Search ================= */

    useEffect(() => {
        const filtered = attachments.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredAttachments(filtered);
    }, [search, attachments]);



    const deleteAttachment = async (id: number) => {
        if (!confirm("Are you sure you want to delete this attachment?")) return;

        try {
            await deleteAttachmentAPI(id);

            // ✅ Refresh list after delete
            await fetchAttachments();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete attachment");
        }
    };
    /* ================= UI ================= */

    return (
    <div className="space-y-8">
        
        {/* ===== Header ===== */}
        <div className="attachments-header">

            <div className="attachments-header-content">

                <h1 className="attachments-title">
                    Attachments
                </h1>

                <p className="attachments-subtitle">
                    Upload and manage reusable files for email campaigns.
                </p>

            </div>

            <button
                onClick={openAdd}
                className="attachments-add-btn"
            >
                <Plus size={18} />
                Add Attachment
            </button>

        </div>


        {/* FILTER CARD */}

        <div className="attachments-filter-card">

            <div className="attachments-toolbar">

                {/* Search */}

                <div className="attachments-toolbar-search">

                    <div className="attachments-search">

                        <Search size={18} />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search attachments..."
                            className="attachments-input"
                        />

                    </div>

                </div>

                {/* Actions */}

                <div className="attachments-toolbar-actions">

                    <button
                        type="button"
                        className="attachments-btn attachments-btn-outline"
                    >
                        <Filter size={16} />
                        Filter
                    </button>

                </div>

            </div>

        </div>

        {/* Cards */}

        {loading ? (
            <div className="attachment-loading-card">
                Loading attachments...
            </div>
        ) : filteredAttachments.length === 0 ? (
            <div className="attachment-empty-card">

                <FileText className="attachment-empty-icon" />

                <h3>No attachments</h3>

                <p>Upload files to reuse them in your campaigns.</p>

            </div>
        ) : (

        <div className="attachment-grid">

            {filteredAttachments.map((att) => (

                <div
                    key={att.id}
                    className="attachment-card"
                >

                    {/* Header */}

                    <div className="attachment-card-header">

                        <div className="attachment-card-info">

                            <div className="attachment-icon">
                                <FileText size={22} />
                            </div>

                            <div className="attachment-content">

                                <h3>{att.name}</h3>

                                <p className="attachment-description">
                                    {att.fileName}
                                </p>

                                <span className="attachment-meta">
                                    {att.size} • Added {att.createdAt}
                                </span>

                            </div>

                        </div>

                        <div className="attachment-menu">

                            <button className="attachment-menu-btn">
                                <MoreHorizontal size={18} />
                            </button>

                        </div>

                    </div>

                    {/* Actions */}

                    <div className="attachment-actions">

                        <button
                            className="attachment-btn attachment-btn-outline"
                        >
                            <Eye size={16} />
                            View
                        </button>

                        <button
                            onClick={() => openEdit(att)}
                            className="attachment-btn attachment-btn-outline"
                        >
                            <Edit size={16} />
                            Edit
                        </button>

                        <button
                            onClick={() => deleteAttachment(att.id)}
                            className="attachment-btn attachment-btn-danger"
                        >
                            <Trash2 size={16} />
                        </button>

                    </div>

                </div>

            ))}

        </div>

        )}

            {/* ================= Modal ================= */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                    {/* ===== Header ===== */}
                    <div className="flex items-start justify-between px-6 py-5 border-b">
                        <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {editing ? "Edit Attachment" : "Add Attachment"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {editing
                            ? "Update attachment name"
                            : "Upload a file to reuse in campaigns"}
                        </p>
                        </div>
                        <button
                        onClick={() => setShowModal(false)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                        ✕
                        </button>
                    </div>

                    {/* ===== Body ===== */}
                    <div className="px-6 py-6 space-y-6">

                        {/* Attachment Name */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Attachment Name
                        </label>
                        <div className="relative mt-2">
                            <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Invoice Template – 2025"
                            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            This name will be shown when selecting attachments.
                        </p>
                        </div>

                        {/* Upload File */}
                        {!editing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload File
                            </label>

                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center hover:border-blue-400 hover:bg-blue-50 transition">
                            <Upload className="h-6 w-6 text-blue-600" />
                            <p className="text-sm font-medium text-gray-700">
                                Click to upload or drag & drop
                            </p>
                            <p className="text-xs text-gray-500">
                                PDF, DOCX, XLSX, ZIP up to 10MB
                            </p>

                            <input
                                type="file"
                                className="hidden"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                            />
                            </label>

                            {file && (
                            <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                                <CheckCircle className="h-4 w-4" />
                                {file.name}
                            </div>
                            )}
                        </div>
                        )}
                    </div>

                    {/* ===== Footer ===== */}
                    <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
                        <button
                        onClick={() => setShowModal(false)}
                        className="rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                        Cancel
                        </button>

                        <button
                        disabled={saving}
                        onClick={saveAttachment}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60"
                        >
                        {saving ? "Saving…" : editing ? "Update Attachment" : "Add Attachment"}
                        </button>
                    </div>
                    </div>
                </div>
            )}
        </div>
    );
}