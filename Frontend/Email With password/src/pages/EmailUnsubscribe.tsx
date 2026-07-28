import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { unsubscribeEmail } from "../api/recipients";

const reasons = [
    "Too many emails",
    "Content not relevant",
    "I don’t remember signing up",
    "Emails are too frequent",
    "Other",
];

export default function Unsubscribe() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [invalidLink, setInvalidLink] = useState(false);

    const navigate = useNavigate();

    // ✅ Validate token on load
    useEffect(() => {
        if (!token) {
            setInvalidLink(true);
            return;
        }

        console.log("Token from URL:", token);

        // ✅ check if already unsubscribed
        const unsubscribedTokens = JSON.parse(
            localStorage.getItem("unsubscribedTokens") || "[]"
        );

        if (unsubscribedTokens.includes(token)) {
            setSuccess(true); // skip form
        }
    }, [token]);
    
    const handleUnsubscribe = async () => {
        if (!selectedReason) {
            alert("Please select a reason");
            return;
        }

        if (selectedReason === "Other" && !customReason.trim()) {
            alert("Please enter your reason");
            return;
        }

        if (!token) {
            alert("Invalid unsubscribe link");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                token: token,
                reason:
                    selectedReason === "Other"
                        ? customReason
                        : selectedReason,
            };

            const data = await unsubscribeEmail(payload);

            console.log("API Response:", data);

            // ✅ store token locally
            const unsubscribedTokens = JSON.parse(
                localStorage.getItem("unsubscribedTokens") || "[]"
            );

            if (!unsubscribedTokens.includes(token)) {
                unsubscribedTokens.push(token);
                localStorage.setItem(
                    "unsubscribedTokens",
                    JSON.stringify(unsubscribedTokens)
                );
            }

            // ✅ success UI
            setSuccess(true);

        } catch (err: any) {
            console.error(err);

            const errorMessage = err?.error || err?.message;

            if (errorMessage === "Invalid or expired token") {
                setInvalidLink(true);
            } else {
                alert(errorMessage || "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    // ❌ Invalid token UI
    if (invalidLink) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">
                Invalid or expired link
            </h2>
            <p className="text-gray-500 text-sm mb-4">
                This unsubscribe link is not valid anymore.
            </p>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">

            {!success ? (
            <>
                {/* Header */}
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Unsubscribe from emails
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                We’re sorry to see you go. Help us improve by telling us why you're leaving.
                </p>

                {/* Reasons */}
                <div className="space-y-3 mb-6">
                {reasons.map((reason) => (
                    <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition 
                    ${
                        selectedReason === reason
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    >
                    <input
                        type="radio"
                        name="reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                    </label>
                ))}
                </div>

                {/* Other reason */}
                {selectedReason === "Other" && (
                <textarea
                    placeholder="Tell us more..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full border rounded-lg p-3 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                >
                    ← Go back
                </button>

                <button
                    onClick={handleUnsubscribe}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition shadow"
                >
                    {loading ? "Unsubscribing..." : "Unsubscribe"}
                </button>
                </div>
            </>
            ) : (
            <>
                {/* Success */}
                <div className="text-center py-10">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-semibold mb-2">
                    You’ve been unsubscribed
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    You will no longer receive emails from us.
                </p>
                </div>
            </>
            )}

        </div>
        </div>
    );
}