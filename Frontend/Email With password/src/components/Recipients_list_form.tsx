import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (data: FormData) => void;
    isEdit?: boolean;
    initialData?: {
        name: string;
        description: string;
    };
}

export default function RecipientsListForm({
    open,
    onClose,
    onSave,
    isEdit = false,
    initialData
}: Props) {

    const [listName, setListName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState("");

    // ✅ Email states
    const [isEmail, setIsEmail] = useState(false);
    const [emails, setEmails] = useState<string[]>([]);

    const inputClass =
        "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm " +
        "placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white";

    const labelClass = "text-sm font-medium text-gray-700 mb-1 block";

    // ✅ Prefill in edit mode
    useEffect(() => {
        if (open && initialData) {
            setListName(initialData.name || "");
            setDescription(initialData.description || "");
        }
    }, [open, initialData]);

    // ✅ Reset function
    const resetForm = () => {
        setListName("");
        setDescription("");
        setFile(null);
        setError("");
        setIsEmail(false);
        setEmails([]);
    };

    // ✅ Handle email selection
    const handleEmailChange = (email: string) => {
        setEmails((prev) =>
            prev.includes(email)
                ? prev.filter((e) => e !== email)
                : [...prev, email]
        );
    };

    // Dummy emails (replace with API later if needed)
    const emailOptions = [
        "info-it@rohankumar.online",
        "nridesk@sharesamadhan.com",
        "pratikshya7890.ss@gmail.com",
    ];

    // ✅ Close handler
    const handleClose = () => {
        if (!isEdit) resetForm();
        onClose();
    };

    if (!open) return null;

    // ✅ File validation
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        const allowedTypes = [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ];

        if (!allowedTypes.includes(selected.type)) {
            setError("Only CSV or Excel files are allowed.");
            return;
        }

        setError("");
        setFile(selected);
    };

    // ✅ Submit
    const handleSubmit = () => {
        if (!listName.trim()) {
            setError("List name is required.");
            return;
        }

        if (!file && !isEdit) {
            setError("Please upload one CSV or Excel file.");
            return;
        }

        if (isEmail && emails.length === 0) {
            setError("Please select at least one email.");
            return;
        }

        const formData = new FormData();
        formData.append("list_name", listName);
        formData.append("list_description", description);

        if (file) {
            formData.append("list_file", file);
        }

        // ✅ SEND EMAILS
        if (isEmail) {
            emails.forEach((email) => {
                formData.append("emails", email);
            });
        }

        onSave(formData);

        if (!isEdit) resetForm();
        onClose();
    };

    // ✅ CSV escape
    const escapeCSV = (value: string) => {
        if (value.includes(",") || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    };

    // ✅ Download CSV
    const downloadSampleCSV = () => {
        const headers = [
            "First_Name","Last_Name","Designation","Mobile","Mobile_01","Mobile_02",
            "Email_id","Email_id_01","Email_id_02","Company_Name","Address",
            "State","City","Locality","Pincode","Father_Name"
        ];

        const sampleData = [
            [
                "John","Doe","Manager","9876543210","9876500000","",
                "john@example.com","john.work@example.com","",
                "Google","123 Street","Haryana","Gurgaon",
                "DLF Phase 3","122002","Robert Doe"
            ],
            [
                "Jane","Smith","Developer","9123456780","","",
                "jane@example.com","","",
                "Amazon","456 Avenue","Haryana","Gurgaon",
                "Sector 45","122003","Michael Smith"
            ]
        ];

        const csvContent =
            headers.join(",") +
            "\n" +
            sampleData.map(row => row.map(escapeCSV).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "sample_recipients.csv";
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex sm:items-center justify-center">
            <div className="bg-white w-full max-w-full sm:max-w-md md:max-w-lg h-full sm:h-auto rounded-none sm:rounded-xl shadow-xl overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                        {isEdit ? "Edit Recipient List" : "Create Recipient List"}
                    </h2>
                    <button onClick={handleClose}>
                        <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6 space-y-5">

                    {/* Name */}
                    <div>
                        <label className={labelClass}>
                            List Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={listName}
                            onChange={(e) => setListName(e.target.value)}
                            placeholder="Marketing subscribers"
                            className={inputClass}
                        />
                    </div>

                    {/* ✅ Email Toggle */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={isEmail}
                            onChange={() => setIsEmail(!isEmail)}
                            className="h-4 w-4"
                        />
                        <label className="text-sm text-gray-700">
                            Send Emails to Selected Users
                        </label>
                    </div>

                    {/* ✅ Email List */}
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

                    {/* Description */}
                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* Upload */}
                    <div>
                        <label className={labelClass}>
                            Import File {!isEdit && <span className="text-red-500">*</span>}
                        </label>

                        <label className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition px-6 py-8">
                            <Upload className="h-9 w-9 text-blue-500 mb-3" />
                            <p className="text-sm font-medium text-gray-700">
                                Click to upload or drag & drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                CSV, XLS, XLSX (max 10MB)
                            </p>

                            <input
                                type="file"
                                hidden
                                accept=".csv,.xls,.xlsx"
                                onChange={handleFileChange}
                            />
                        </label>

                        {file && (
                            <div className="mt-3 bg-green-50 px-3 py-2 text-sm text-green-700 rounded-lg">
                                ✅ {file.name}
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Download */}
                    <button
                        type="button"
                        onClick={downloadSampleCSV}
                        className="w-full text-sm text-blue-600 hover:underline flex justify-center"
                    >
                        Download sample CSV format
                    </button>

                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end px-4 sm:px-6 py-4 border-t bg-gray-50">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                        {isEdit ? "Update List" : "Create List"}
                    </button>
                </div>
            </div>
        </div>
    );
}