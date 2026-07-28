import { useEffect, useState } from "react";
import { Monitor, Tablet, Smartphone, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { listTemplates, getTemplateById } from "../../api/recipients";

export default function TemplateView() {
    const navigate = useNavigate();
    const { slug } = useParams();

    const [html, setHtml] = useState("");
    const [css, setCss] = useState("");
    const [js, setJs] = useState("");
    const [srcDoc, setSrcDoc] = useState("");

    const [view, setView] = useState("desktop");
    const [templateName, setTemplateName] = useState("");

    /* ================= Fetch Template ================= */
    useEffect(() => {
        if (!slug) return;

        const fetchTemplate = async () => {
            try {
                const res = await listTemplates();

                const template = res.data.find((t: any) =>
                    t.template_name.toLowerCase().replace(/\s+/g, "-") === slug
                );

                if (!template) return;

                const detail = await getTemplateById(template.id);
                const data = detail.data[0];

                setHtml(data.html || "");
                setCss(data.css || "");
                setJs(data.js || "");
                setTemplateName(data.template_name || "");

            } catch (err) {
                console.error(err);
            }
        };

        fetchTemplate();
    }, [slug]);

    /* ================= Render Code ================= */
    useEffect(() => {
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
    }, [html, css, js]);

    /* ================= View Width ================= */
    const getWidth = () => {
        if (view === "mobile") return "375px";
        if (view === "tablet") return "768px";
        return "100%";
    };

    /* ================= Breadcrumb ================= */
    const breadcrumb = [
        { label: "Home", path: "/" },
        { label: "Templates", path: "/emailtemplates" },
        { label: templateName || "Loading...", path: "" },
    ];

    return (
        <div className="h-[750px] flex flex-col bg-gray-900 text-white">

            {/* Header */}
            <div className="px-6 py-3 bg-gray-800 shadow flex flex-col gap-2">

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                        >
                            <ArrowLeft size={16} />
                        </button>

                        <h1 className="text-lg font-semibold">
                            {templateName || "Template Preview"}
                        </h1>
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="text-xs text-gray-400">
                    {breadcrumb.map((item, index) => (
                        <span key={index}>
                            <button
                                onClick={() => item.path && navigate(item.path)}
                                className="hover:text-gray-300"
                            >
                                {item.label}
                            </button>
                            {index < breadcrumb.length - 1 && " / "}
                        </span>
                    ))}
                </div>
            </div>

            {/* Preview Only */}
            <div className="flex-1 flex flex-col items-center bg-gray-100 text-black p-4">

                {/* Device Buttons */}
                <div className="flex gap-3 mb-3">
                    <button
                        onClick={() => setView("desktop")}
                        className={`p-2 rounded-lg ${view === "desktop" ? "bg-blue-500 text-white" : "bg-white"}`}
                    >
                        <Monitor size={18} />
                    </button>

                    <button
                        onClick={() => setView("tablet")}
                        className={`p-2 rounded-lg ${view === "tablet" ? "bg-blue-500 text-white" : "bg-white"}`}
                    >
                        <Tablet size={18} />
                    </button>

                    <button
                        onClick={() => setView("mobile")}
                        className={`p-2 rounded-lg ${view === "mobile" ? "bg-blue-500 text-white" : "bg-white"}`}
                    >
                        <Smartphone size={18} />
                    </button>
                </div>

                {/* Preview Frame */}
                <div className="flex justify-center items-center w-full h-full">
                    <iframe
                        title="preview"
                        srcDoc={srcDoc}
                        className="bg-white shadow-lg"
                        style={{ width: getWidth(), height: "95%" }}
                    />
                </div>
            </div>
        </div>
    );
}