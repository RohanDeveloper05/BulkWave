import { useEffect, useState } from "react";
import {
    Menu,
    Search,
    Settings,
    HelpCircle,
    Grid,
    ArrowLeft,
    Archive,
    Trash2,
    Mail,
    Clock,
    Reply,
    MoreVertical,
    Smartphone,
    Tablet,
    Monitor,
    User,
} from "lucide-react";

interface PreviewData {
    subject: string;
    fromName: string;
    fromEmail: string;
    replyTo: string;
    body: string;
    date: string;
}

export default function EmailPreview() {
    const [data, setData] = useState<PreviewData | null>(null); 
    const [view, setView] = useState<"desktop" | "tablet" | "mobile">("desktop");

    useEffect(() => {
        const stored = localStorage.getItem("emailPreviewData");
        if (stored) setData(JSON.parse(stored));
    }, []);

    if (!data) {
        return <div className="p-10 text-center">No preview data</div>;
    }

    const containerWidth =
        view === "mobile"
        ? "max-w-[390px]"
        : view === "tablet"
        ? "max-w-[768px]"
        : "w-full";

    return (
        <div className="h-screen flex flex-col bg-[#f6f8fc]">


        {/* VIEW SWITCHER */}
        <div className="flex justify-center py-0.5 bg-[#a7aab0] border-b">
            <div className="flex items-center gap-1 p-1 bg-white border rounded-lg shadow-sm">

                {/* Desktop */}
                <button
                onClick={() => setView("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all duration-200
                    ${
                    view === "desktop"
                        ? "bg-[#1a73e8] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
                </button>

                {/* Tablet */}
                <button
                onClick={() => setView("tablet")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all duration-200
                    ${
                    view === "tablet"
                        ? "bg-[#1a73e8] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                <Tablet className="h-3.5 w-3.5" />
                Tablet
                </button>

                {/* Mobile */}
                <button
                onClick={() => setView("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all duration-200
                    ${
                    view === "mobile"
                        ? "bg-[#1a73e8] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
                </button>

            </div>
        </div>

        {/* ✅ DESKTOP TOP NAVBAR */}
        {view === "desktop" && (
            <div className="flex items-center justify-between px-4 py-2 bg-[#202124] text-white">
                <div className="flex items-center gap-4">
                    <Menu className="h-5 w-5" />
                    <h1 className="font-semibold text-lg">Gmail</h1>
                </div>

                <div className="hidden md:flex items-center gap-3 bg-[#303134] px-4 py-2 rounded-full w-[40%]">
                    <Search className="h-4 w-4 text-gray-300" />
                    <input
                    placeholder="Search mail"
                    className="bg-transparent outline-none text-sm w-full text-white"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <HelpCircle className="h-5 w-5" />
                    <Settings className="h-5 w-5" />
                    <Grid className="h-5 w-5" />
                    <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                    </div>
                </div>
            </div>
        )}

        <div className="flex flex-1 overflow-hidden justify-center">

            {/* ✅ DESKTOP SIDEBAR */}
            {view === "desktop" && (
            <div className="w-[220px] bg-[#202124] text-white p-4 space-y-4">
                <button className="bg-white text-black px-4 py-2 rounded-full w-full text-left">
                Compose
                </button>

                <div className="space-y-2 text-sm">
                <p className="font-semibold">Inbox</p>
                <p className="text-gray-400">Starred</p>
                <p className="text-gray-400">Snoozed</p>
                <p className="text-gray-400">Sent</p>
                <p className="text-gray-400">Drafts</p>
                </div>
            </div>
            )}

            {/* ✅ EMAIL VIEW */}
            <div className={`flex flex-col bg-[#f6f8fc] ${containerWidth} w-full`}>

            {/* ✅ MOBILE/TABLET HEADER */}
            {view !== "desktop" && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
                <div className="flex items-center gap-3">
                    <ArrowLeft className="h-5 w-5 text-gray-700" />
                    <span className="text-sm text-gray-500">Inbox</span>
                </div>

                <div className="flex items-center gap-4 text-gray-600">
                    <Archive className="h-5 w-5" />
                    <Trash2 className="h-5 w-5" />
                    <Mail className="h-5 w-5" />
                    <MoreVertical className="h-5 w-5" />
                </div>
                </div>
            )}

            {/* ✅ DESKTOP TOOLBAR */}
            {view === "desktop" && (
                <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
                <div className="flex items-center gap-3 text-gray-600">
                    <ArrowLeft className="h-5 w-5" />
                    <Archive className="h-5 w-5" />
                    <Trash2 className="h-5 w-5" />
                    <Mail className="h-5 w-5" />
                    <Clock className="h-5 w-5" />
                </div>
                <MoreVertical className="h-5 w-5 text-gray-600" />
                </div>
            )}

            {/* ✅ CONTENT */}
            <div
                className={`flex-1 overflow-auto py-4 ${
                view === "desktop" ? "px-6" : "px-4"
                }`}
            >
                {/* SUBJECT */}
                <h1
                className={`text-gray-900 mb-4 ${
                    view === "mobile"
                    ? "text-base font-medium"
                    : "text-xl font-semibold"
                }`}
                >
                {data.subject}
                </h1>

                {/* SENDER INFO */}
                <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
                    {data.fromName?.charAt(0)}
                    </div>

                    <div>
                    <p className="text-sm font-semibold text-gray-900">
                        {data.fromName}
                    </p>
                    <p className="text-xs text-gray-500">
                        &lt;{data.fromEmail}&gt;
                    </p>
                    {data.replyTo && (
                        <p className="text-xs text-gray-400">
                        Reply-To: {data.replyTo}
                        </p>
                    )}
                    </div>
                </div>

                <p className="text-xs text-gray-500">{data.date}</p>
                </div>

                {/* EMAIL BODY */}
                <div className="bg-white border rounded-md overflow-hidden">
                <iframe
                    title="email-preview"
                    className="w-full min-h-[500px] md:min-h-[600px] border-0"
                    srcDoc={data.body}
                />
                </div>

                {/* ACTION BUTTONS */}
                <div
                className={`flex gap-3 mt-6 ${
                    view === "desktop" ? "justify-center" : "flex-col"
                }`}
                >
                <button className="flex items-center justify-center gap-2 px-4 py-3 border rounded-full hover:bg-gray-100 w-full md:w-auto">
                    <Reply className="h-4 w-4" /> Reply
                </button>

                <button className="px-4 py-3 border rounded-full hover:bg-gray-100 w-full md:w-auto">
                    Forward
                </button>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}
