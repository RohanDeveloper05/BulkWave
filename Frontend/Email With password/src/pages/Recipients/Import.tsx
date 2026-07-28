import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import clsx from 'clsx';
import Papa from 'papaparse';

export default function Import() {
    const [csvData, setCsvData] = useState<any[]>([]);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
    const [showImportPreview, setShowImportPreview] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
        'text/csv': ['.csv'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        },
        onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            Papa.parse(file, {
            complete: (results) => {
                setCsvHeaders(results.meta.fields || []);
                setCsvData(results.data.slice(0, 100)); // Preview first 100 rows
                setShowImportPreview(true);
            },
            header: true,
            skipEmptyLines: true
            });
        }
        }
    });

    const handleImport = () => {
        console.log('Importing with mapping:', fieldMapping);
        setShowImportPreview(false);
        setCsvData([]);
        setCsvHeaders([]);
        setFieldMapping({});
    };

    return (
        <div className="import-page">

            {!showImportPreview ? (

                <div className="import-card">

                    <div className="import-header">
                        <h2>Import Recipients</h2>

                        <p>
                            Upload a CSV or Excel file to import recipients in bulk.
                        </p>
                    </div>

                    <div
                        {...getRootProps()}
                        className={clsx(
                            "import-dropzone",
                            isDragActive && "import-dropzone-active"
                        )}
                    >
                        <input {...getInputProps()} />

                        <div className="import-upload-icon">
                            <Upload size={34} />
                        </div>

                        <h3>
                            {isDragActive
                                ? "Drop your file here"
                                : "Drag & Drop your file here"}
                        </h3>

                        <p>or click to browse your computer</p>

                        <span className="import-file-info">
                            CSV, XLS, XLSX • Maximum 10 MB
                        </span>

                    </div>

                    <div className="import-requirements">

                        <h4>File Requirements</h4>

                        <ul>
                            <li>First row should contain column headers.</li>
                            <li>Email column is required.</li>
                            <li>Supported fields: Email, First Name, Last Name, Company, Phone, etc.</li>
                            <li>Maximum 10,000 recipients per import.</li>
                        </ul>

                    </div>

                </div>

            ) : (

                <div className="import-preview-card">

                    <div className="import-preview-header">

                        <div>

                            <h2>Map Your Columns</h2>

                            <p>
                                Match each CSV column to a recipient field.
                            </p>

                        </div>

                        <button
                            onClick={() => setShowImportPreview(false)}
                            className="import-close-btn"
                        >
                            <X size={18} />
                        </button>

                    </div>

                    <div className="import-mapping-grid">

                        {csvHeaders.map((header) => (

                            <div
                                key={header}
                                className="import-field-row"
                            >

                                <label>{header}</label>

                                <select
                                    value={fieldMapping[header] || ""}
                                    onChange={(e) =>
                                        setFieldMapping(prev => ({
                                            ...prev,
                                            [header]: e.target.value
                                        }))
                                    }
                                    className="import-select"
                                >

                                    <option value="">Don't Import</option>
                                    <option value="email">Email</option>
                                    <option value="firstName">First Name</option>
                                    <option value="lastName">Last Name</option>
                                    <option value="company">Company</option>
                                    <option value="phone">Phone</option>
                                    <option value="custom1">Custom Field 1</option>
                                    <option value="custom2">Custom Field 2</option>

                                </select>

                            </div>

                        ))}

                    </div>

                    <div className="import-footer">

                        <button
                            onClick={() => setShowImportPreview(false)}
                            className="import-btn import-btn-outline"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleImport}
                            className="import-btn"
                        >
                            Import {csvData.length} Recipients
                        </button>

                    </div>

                    <div className="import-table-card">

                        <div className="import-table-header">
                            <h3>Preview (First 5 Rows)</h3>
                        </div>

                        <div className="import-table-wrapper custom-scrollbar">

                            <table className="import-table">

                                <thead>

                                    <tr>

                                        {csvHeaders.map((header) => (
                                            <th key={header}>
                                                {header}
                                            </th>
                                        ))}

                                    </tr>

                                </thead>

                                <tbody>

                                    {csvData.slice(0, 5).map((row, index) => (

                                        <tr key={index}>

                                            {csvHeaders.map((header) => (

                                                <td key={header}>
                                                    {row[header]}
                                                </td>

                                            ))}

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}