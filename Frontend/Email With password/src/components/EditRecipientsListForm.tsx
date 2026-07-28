import { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";

interface ListData {
  id: number;
  name: string;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (id: number, data: FormData) => void;
  list: ListData | null;
}

export default function EditRecipientsListForm({
  open,
  onClose,
  onSave,
  list
}: Props) {
  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm " +
    "placeholder-gray-400 transition " +
    "focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 " +
    "focus:bg-white";

  const labelClass = "text-sm font-medium text-gray-700 mb-1 block";

  /* ---------------- PREFILL DATA ---------------- */
  useEffect(() => {
    if (list) {
      setListName(list.name);
      setDescription(list.description || "");
      setFile(null);
      setError("");
    }
  }, [list]);

  if (!open || !list) return null;

  /* ---------------- FILE HANDLER ---------------- */
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

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = () => {
    if (!listName.trim()) {
      setError("List name is required.");
      return;
    }

    const formData = new FormData();
    formData.append("list_name", listName);
    formData.append("list_description", description);

    // File is OPTIONAL for edit
    if (file) {
      formData.append("list_file", file);
    }

    onSave(list.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex sm:items-center justify-center">
      <div
        className="
          bg-white w-full
          max-w-full sm:max-w-md md:max-w-lg
          h-full sm:h-auto
          rounded-none sm:rounded-xl
          shadow-xl
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Edit Recipient List
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* List Name */}
          <div>
            <label className={labelClass}>
              List Name <span className="text-red-500">*</span>
            </label>
            <input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className={inputClass}
            />
          </div>

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

          {/* File Upload (Optional) */}
          <div>
            <label className={labelClass}>Replace File (optional)</label>

            <label
              className="
                mt-2 flex flex-col items-center justify-center
                rounded-xl border-2 border-dashed border-gray-300
                bg-gray-50 cursor-pointer
                hover:border-blue-400 hover:bg-blue-50
                transition px-4 py-6
              "
            >
              <Upload className="h-8 w-8 text-blue-500 mb-3" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload new file
              </p>
              <p className="text-xs text-gray-500 mt-1">
                CSV, XLS, XLSX
              </p>

              <input
                type="file"
                hidden
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
              />
            </label>

            {file && (
              <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                ✅ {file.name}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end px-4 sm:px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Update List
          </button>
        </div>
      </div>
    </div>
  );
}
