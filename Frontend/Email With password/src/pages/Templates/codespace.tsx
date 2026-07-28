import { useState, useEffect } from "react";
import { Play, Monitor, Tablet, Smartphone, ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { createTemplate, updateTemplate, getTemplateById, listTemplates } from "../../api/recipients"; 


export default function LiveEditor() {
    const [html, setHtml] = useState("<h1 class='title'>Hello World</h1>");
    const [css, setCss] = useState("body { font-family: Arial; background:#f9fafb } .title{color:#2563eb}");
    const [js, setJs] = useState("console.log('Hello from JS');");
    const [srcDoc, setSrcDoc] = useState("");
    const [view, setView] = useState("desktop");
    const [activeTab, setActiveTab] = useState("html");
    const [emails, setEmails] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [templateId, setTemplateId] = useState<number | null>(null);

    // modal state
    const [showModal, setShowModal] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [isEmail, setIsEmail] = useState(false);
    const [description, setDescription] = useState("");

    const navigate = useNavigate();
    const { slug } = useParams();

    useEffect(() => {
        if (!slug) return;

        const fetchTemplate = async () => {
            try {
                const res = await listTemplates();

                const template = res.data.find((t: any) =>
                    t.template_name.toLowerCase().replace(/\s+/g, "-") === slug
                );

                if (!template) return;

                // ✅ store ID
                setTemplateId(template.id);

                // now fetch full data by id
                const detail = await getTemplateById(template.id);
                const data = detail.data[0];

                setHtml(data.html || "");
                setCss(data.css || "");
                setJs(data.js || "");
                setTemplateName(data.template_name || "");
                setDescription(data.description || "");

            } catch (error) {
                console.error(error);
            }
        };

        fetchTemplate();
    }, [slug]);

    const handleEmailChange = (email: string) => {
        if (emails.includes(email)) {
            setEmails(emails.filter(e => e !== email));
        } else {
            setEmails([...emails, email]);
        }
    };

    const breadcrumb = [
        { label: "Home", path: "/" },
        { label: "Templates", path: "/emailtemplates" },
        {
            label: slug ? (templateName || "Loading...") : "Live Editor",
            path: "",
        },
    ];

    const emailOptions = [
        "info-it@rohankumar.online",
        "nridesk@sharesamadhan.com",
        "pratikshya.bhatt@sharesamadhan.com",
        "pratikshya7890.ss@gmail.com"
    ];

    const runCode = () => {
        const code = `
            <html>
                <head>
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script>
                        try {
                            ${js}
                        } catch (error) {
                            document.body.innerHTML += '<pre style="color:red">' + error + '</pre>';
                        }
                    <\/script>
                </body>
            </html>
        `;
        setSrcDoc(code);
    };

    const getWidth = () => {
        if (view === "mobile") return "375px";
        if (view === "tablet") return "768px";
        return "100%";
    };

    const renderEditor = () => {
        const commonClass = "w-full h-[600px] p-3 bg-black text-green-400 rounded-xl font-mono text-sm outline-none";

        if (activeTab === "html") {
        return <textarea className={commonClass} value={html} onChange={(e) => setHtml(e.target.value)} />;
        }
        if (activeTab === "css") {
        return <textarea className={commonClass} value={css} onChange={(e) => setCss(e.target.value)} />;
        }
        return <textarea className={commonClass} value={js} onChange={(e) => setJs(e.target.value)} />;
    };


    const handleSave = async () => {
        try {
            setLoading(true);

            const payload = {
                template_name: templateName,
                description,
                html,
                css,
                js,
                emails: isEmail ? emails.join(",") : "",
            };

            if (templateId) {
                await updateTemplate(templateId, payload);
                alert("Template updated ✅");
            } else {
                await createTemplate(payload);
                alert("Template created ✅");
            }

            setShowModal(false);

        } catch (error) {
            console.error(error);
            alert("Failed ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[750px] flex flex-col bg-gray-900 text-white">
        {/* Header */}
        <div className="px-6 py-3 bg-gray-800 shadow flex flex-col gap-2">
            {/* Top Row */}
            <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <button
                onClick={() => window.history.back()}
                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                <ArrowLeft size={16} />
                </button>
                <h1 className="text-lg font-semibold">Live Code Editor</h1>
            </div>

            <div className="flex gap-2">
                <button
                onClick={runCode}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
                >
                <Play size={16} /> Run
                </button>

                <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl"
                >
                <Save size={16} /> Save
                </button>
            </div>
            </div>

            {/* Breadcrumb */}
            <div className="text-xs text-gray-400 mb-2">
            {breadcrumb.map((item, index) => (
                <span key={index}>
                <button
                    onClick={() => navigate(item.path)}
                    className="hover:text-gray-600 transition"
                >
                    {item.label}
                </button>
                {index < breadcrumb.length - 1 && " / "}
                </span>
            ))}
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Editor */}
            <div className="w-1/2 p-4 flex flex-col gap-3 bg-gray-950">
            <div className="flex gap-2">
                {["html", "css", "js"].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1 rounded-full text-sm capitalize ${activeTab === tab ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                >
                    {tab}
                </button>
                ))}
            </div>

            <div className="flex-1">{renderEditor()}</div>
            </div>

            {/* Preview */}
            <div className="w-1/2 p-4 flex flex-col items-center bg-gray-100 text-black">
            <div className="flex gap-3 mb-3">
                <button onClick={() => setView("desktop")} className={`p-2 rounded-lg ${view === "desktop" ? "bg-blue-500 text-white" : "bg-white"}`}><Monitor size={18} /></button>
                <button onClick={() => setView("tablet")} className={`p-2 rounded-lg ${view === "tablet" ? "bg-blue-500 text-white" : "bg-white"}`}><Tablet size={18} /></button>
                <button onClick={() => setView("mobile")} className={`p-2 rounded-lg ${view === "mobile" ? "bg-blue-500 text-white" : "bg-white"}`}><Smartphone size={18} /></button>
            </div>

            <div className="flex justify-center items-center w-full h-full">
                <iframe title="output" srcDoc={srcDoc} className="bg-white shadow-lg" style={{ width: getWidth(), height: "95%" }} />
            </div>
            </div>
        </div>

        {/* Save Modal */}
            {showModal && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className="bg-white text-black w-[450px] rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Save Template</h2>
                </div>

                {/* ===== Body ===== */}
                <div className="px-6 py-6 space-y-6">

                    {/* Template Name */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Template Name
                    </label>
                    <div className="relative mt-2">
                        <input
                        value={templateName}
                        onChange={e => setTemplateName(e.target.value)}
                        placeholder="Invoice Template – 2025"
                        className="w-full rounded-xl border border-gray-300 bg-white py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    </div>

                    {/* Email Checkbox */}
                    <div className="flex flex-col gap-3">
                        
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isEmail}
                                onChange={() => setIsEmail(!isEmail)}
                                className="h-4 w-4"
                            />
                            <label className="text-sm text-gray-700">
                                Use as Email Template
                            </label>
                        </div>

                        {/* Show email list */}
                        {isEmail && (
                            <div className="space-y-2 max-h-40 overflow-y-auto border p-3 rounded-xl bg-gray-50">
                                {emailOptions.map((email) => (
                                    <div key={email} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={emails.includes(email)}
                                            onChange={() => handleEmailChange(email)}
                                            className="h-4 w-4"
                                        />
                                        <label className="text-sm text-gray-700">{email}</label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        placeholder="Write short description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
                        >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`px-4 py-2 rounded-xl text-white text-sm ${
                            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading ? "Saving..." : "Save Template"}
                    </button>
                </div>

                </div>
            </div>
                    )}
        </div>
    );
}