// components/ComposeAttachments.tsx
import { useDropzone } from 'react-dropzone';
import { Paperclip, X } from 'lucide-react';
import clsx from 'clsx';
import { Dispatch, SetStateAction } from 'react';

interface Props {
    uploadedAttachments: File[];
    setUploadedAttachments: Dispatch<SetStateAction<File[]>>;
    selectedAttachmentNames: string[];
    setSelectedAttachmentNames: Dispatch<SetStateAction<string[]>>;
    preloadedAttachments: string[];
    loadingAttachments: boolean;
}

export default function ComposeAttachments({
    uploadedAttachments,
    setUploadedAttachments,
    selectedAttachmentNames,
    setSelectedAttachmentNames,
    preloadedAttachments,
    loadingAttachments,
    }: Props) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
        setUploadedAttachments((prev) => [...prev, ...acceptedFiles]);
        },
        maxSize: 25 * 1024 * 1024, // 25MB
    });

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="compose-card">
        <div className="compose-card-header">
            <div>
            <h2 className="compose-card-title">Attachments</h2>
            <p className="compose-card-subtitle">
                Select existing files or upload new attachments
            </p>
            </div>
            <div className="attachment-count">
            {selectedAttachmentNames.length + uploadedAttachments.length} Selected
            </div>
        </div>

        <div className="mb-6">
            <h3 className="attachment-section-title">Available Attachments</h3>
            {loadingAttachments && <div className="attachment-empty">Loading attachments...</div>}
            {!loadingAttachments && preloadedAttachments.length === 0 && (
            <div className="attachment-empty">No attachments available</div>
            )}

            <div className="attachment-chip-wrapper">
            {preloadedAttachments.map((name) => {
                const checked = selectedAttachmentNames.includes(name);
                return (
                <label key={name} className={clsx("attachment-chip", checked && "attachment-chip-active")}>
                    <input
                    type="checkbox"
                    hidden
                    checked={checked}
                    onChange={(e) => {
                        setSelectedAttachmentNames((prev) =>
                        e.target.checked ? [...prev, name] : prev.filter((n) => n !== name)
                        );
                    }}
                    />
                    <Paperclip className="h-4 w-4" />
                    <span>{name}</span>
                    {checked && <span className="attachment-check">✓</span>}
                </label>
                );
            })}
            </div>
        </div>

        <div {...getRootProps()} className={clsx("upload-zone", isDragActive && "upload-zone-active")}>
            <input {...getInputProps()} />
            <div className="upload-icon">
            <Paperclip className="h-8 w-8" />
            </div>
            <h3 className="upload-title">
            {isDragActive ? "Drop your files here" : "Upload New Attachments"}
            </h3>
            <p className="upload-description">
            Drag & drop your files here or
            <span className="upload-link"> browse files</span>
            </p>
            <span className="upload-limit">Maximum upload size: 25 MB</span>
        </div>

        {uploadedAttachments.length > 0 && (
            <div className="uploaded-files">
            <h3 className="attachment-section-title">Uploaded Files</h3>
            {uploadedAttachments.map((file, index) => (
                <div key={index} className="uploaded-file-card">
                <div className="uploaded-file-left">
                    <div className="uploaded-file-icon">
                    <Paperclip className="h-5 w-5" />
                    </div>
                    <div>
                    <h4>{file.name}</h4>
                    <p>{formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setUploadedAttachments((prev) => prev.filter((_, i) => i !== index))}
                    className="remove-file-btn"
                >
                    <X className="h-4 w-4" />
                </button>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}