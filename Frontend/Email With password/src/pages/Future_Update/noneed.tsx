// import { useState } from 'react';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import { useForm } from 'react-hook-form';
// import { useDropzone } from 'react-dropzone';
// import {
// Bold,
// Italic,
// List,
// ListOrdered,
// Paperclip,
// Eye,
// Send,
// Calendar,
// TestTube,
// X,
// User,
// Mail
// } from 'lucide-react';
// import clsx from 'clsx';

// /* -------------------- TYPES -------------------- */

// interface ComposeForm {
// subject: string;
// fromName: string;
// fromEmail: string;
// replyTo: string;
// recipientType: 'single' | 'list' | 'upload';
// recipients: string;
// scheduleDate?: string;
// scheduleTime?: string;
// }

// interface Attachment {
// id: string;
// name: string;
// size: number;
// type: string;
// }

// /* -------------------- CONSTANTS -------------------- */

// const personalizationVariables = [
// { label: 'First Name', value: '{{first_name}}' },
// { label: 'Last Name', value: '{{last_name}}' },
// { label: 'Email', value: '{{email}}' },
// { label: 'Company', value: '{{company}}' },
// { label: 'Custom Field 1', value: '{{custom_1}}' },
// { label: 'Custom Field 2', value: '{{custom_2}}' }
// ];

// const senderProfiles = [
// { id: 1, name: 'Marketing Team', email: 'marketing@company.com' },
// { id: 2, name: 'Support Team', email: 'support@company.com' },
// { id: 3, name: 'Sales Team', email: 'sales@company.com' },
// { id: 4, name: 'Testing', email: 'info-it@rohankumar.online' }
// ];

// /* -------------------- HELPERS -------------------- */

// const formatDate = (date?: string) => {
// if (!date) return null;
// const d = new Date(date);
// return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(
//     d.getDate()
// ).padStart(2, '0')}/${d.getFullYear()}`;
// };

// const formatTime = (time?: string) => {
// if (!time) return null;
// const [h, m] = time.split(':');
// let hour = parseInt(h);
// const ampm = hour >= 12 ? 'PM' : 'AM';
// hour = hour % 12 || 12;
// return `${hour}:${m} ${ampm}`;
// };


// export default function Compose() {
// const [attachments, setAttachments] = useState<Attachment[]>([]);
// const [showPersonalization, setShowPersonalization] = useState(false);
// const [isScheduling, setIsScheduling] = useState(false);

// // ✅ FIXED: Hook now inside component
// const [recipientFile, setRecipientFile] = useState<File | null>(null);

// const { register, handleSubmit, watch, formState: { errors } } = useForm<ComposeForm>({
//     defaultValues: {
//     recipientType: 'single',
//     fromName: 'Marketing Team',
//     fromEmail: 'marketing@company.com',
//     replyTo: 'marketing@company.com'
//     }
// });

// const recipientType = watch('recipientType');

//     const editor = typeof window !== 'undefined'
//     ? useEditor({
//         extensions: [StarterKit],
//         content: '<p>Start writing your email content here...</p>',
//         editorProps: {
//             attributes: {
//             class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4'
//             }
//         }
//         })
//     : null;





// const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop: (acceptedFiles) => {
//     const newAttachments = acceptedFiles.map((file, index) => ({
//         id: `${Date.now()}-${index}`,
//         name: file.name,
//         size: file.size,
//         type: file.type
//     }));
//     setAttachments(prev => [...prev, ...newAttachments]);
//     },
//     maxSize: 25 * 1024 * 1024 // 25MB
// });

// const removeAttachment = (id: string) => {
//     setAttachments(prev => prev.filter(att => att.id !== id));
// };

// const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    
// };

// const insertPersonalization = (variable: string) => {
//     if (editor) {
//     editor.chain().focus().insertContent(variable).run();
//     }
//     setShowPersonalization(false);
// };

// const onSubmit = async (data: ComposeForm) => {
//     if (!editor) return;

//     // 👉 File upload case
//     if (data.recipientType === 'upload' && recipientFile) {
//     const formData = new FormData();

//     formData.append('subject', data.subject);
//     formData.append('from_name', data.fromName);
//     formData.append('from_email', data.fromEmail);
//     formData.append('reply_to', data.replyTo);
//     formData.append('body', editor.getHTML());
//     formData.append('recipient_file', recipientFile);

//     if (isScheduling) {
//         formData.append('schedule_date', formatDate(data.scheduleDate)!);
//         formData.append('schedule_time', formatTime(data.scheduleTime)!);
//     }

//     await fetch('http://127.0.0.1:8000/api/send_email/', {
//         method: 'POST',
//         body: formData
//     });

//     return;
//     }

//     // 👉 Normal email case
//     const payload: any = {
//     subject: data.subject,
//     from_name: data.fromName,
//     from_email: data.fromEmail,
//     reply_to: data.replyTo,
//     body: editor.getHTML(),
//     attachments: [],
//     recipients: {
//         type: 'single recipient',
//         email: data.recipients
//     }
//     };

//     if (isScheduling) {
//     payload.schedule = {
//         date: formatDate(data.scheduleDate),
//         time: formatTime(data.scheduleTime)
//     };
//     }

//     await fetch('http://127.0.0.1:8000/api/send_email/', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload)
//     });
// };



// const handlePreview = () => {
//     // Open preview modal
//     console.log('Preview email');
// };

// const handleTestSend = () => {
//     // Send test email
//     console.log('Send test email');
// };

// return (
//     <div className="space-y-6">
//     {/* Page header */}
//     <div>
//         <h1 className="text-3xl font-bold text-gray-900">Compose Email</h1>
//         <p className="mt-2 text-gray-600">Create and send your email campaign</p>
//     </div>

//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Main compose area */}
//         <div className="lg:col-span-2 space-y-6">
//             {/* Email details */}
//             <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Details</h2>
            
//             <div className="space-y-4">
//                 {/* Subject */}
//                 <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Subject Line *
//                 </label>
//                 <input
//                     type="text"
//                     {...register('subject', { required: 'Subject is required' })}
//                     className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     placeholder="Enter email subject"
//                 />
//                 {errors.subject && (
//                     <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
//                 )}
//                 </div>

//                 {/* From details */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                     From Name
//                     </label>
//                     <input
//                     type="text"
//                     {...register('fromName')}
//                     className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     />
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                     From Email
//                     </label>
//                     <select
//                     {...register('fromEmail')}
//                     className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"

//                     >
//                     {senderProfiles.map(profile => (
//                         <option key={profile.id} value={profile.email}>
//                         {profile.email}
//                         </option>
//                     ))}
//                     </select>
//                 </div>
//                 </div>

//                 {/* Reply-to */}
//                 <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Reply-To Email
//                 </label>
//                 <input
//                     type="email"
//                     {...register('replyTo')}
//                     className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                 />
//                 </div>
//             </div>
//             </div>

//             {/* Content editor */}
//             <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
//             <div className="p-4 border-b border-gray-200">
//                 <div className="flex items-center justify-between mb-3">
//                 <h2 className="text-lg font-semibold text-gray-900">Email Content</h2>
//                 <button
//                     type="button"
//                     onClick={() => setShowPersonalization(!showPersonalization)}
//                     className="text-sm text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                     Add Variables
//                 </button>
//                 </div>
                
//                 {/* Editor toolbar */}
//                 {editor && (
//                 <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 rounded-lg">
//                     <button
//                     type="button"
//                     onClick={() => editor.chain().focus().toggleBold().run()}
//                     className={clsx(
//                         'p-2 rounded hover:bg-gray-200 transition-colors',
//                         editor.isActive('bold') && 'bg-gray-200'
//                     )}
//                     >
//                     <Bold className="h-4 w-4" />
//                     </button>
//                     <button
//                     type="button"
//                     onClick={() => editor.chain().focus().toggleItalic().run()}
//                     className={clsx(
//                         'p-2 rounded hover:bg-gray-200 transition-colors',
//                         editor.isActive('italic') && 'bg-gray-200'
//                     )}
//                     >
//                     <Italic className="h-4 w-4" />
//                     </button>
//                     <button
//                     type="button"
//                     onClick={() => editor.chain().focus().toggleBulletList().run()}
//                     className={clsx(
//                         'p-2 rounded hover:bg-gray-200 transition-colors',
//                         editor.isActive('bulletList') && 'bg-gray-200'
//                     )}
//                     >
//                     <List className="h-4 w-4" />
//                     </button>
//                     <button
//                     type="button"
//                     onClick={() => editor.chain().focus().toggleOrderedList().run()}
//                     className={clsx(
//                         'p-2 rounded hover:bg-gray-200 transition-colors',
//                         editor.isActive('orderedList') && 'bg-gray-200'
//                     )}
//                     >
//                     <ListOrdered className="h-4 w-4" />
//                     </button>
//                 </div>
//                 )}
//             </div>

//             {/* Personalization variables */}
//             {showPersonalization && (
//                 <div className="p-4 bg-blue-50 border-b border-gray-200">
//                 <p className="text-sm font-medium text-gray-700 mb-2">Click to insert:</p>
//                 <div className="flex flex-wrap gap-2">
//                     {personalizationVariables.map(variable => (
//                     <button
//                         key={variable.value}
//                         type="button"
//                         onClick={() => insertPersonalization(variable.value)}
//                         className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
//                     >
//                         {variable.label}
//                     </button>
//                     ))}
//                 </div>
//                 </div>
//             )}

//             {/* Editor */}
//             <EditorContent editor={editor} className="min-h-[300px]" />
//             </div>

//             {/* Attachments */}
//             <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
            
//             <div
//                 {...getRootProps()}
//                 className={clsx(
//                 'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
//                 isDragActive
//                     ? 'border-blue-400 bg-blue-50'
//                     : 'border-gray-300 hover:border-gray-400'
//                 )}
//             >
//                 <input {...getInputProps()} />
//                 <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
//                 <p className="text-sm text-gray-600">
//                 {isDragActive
//                     ? 'Drop files here...'
//                     : 'Drag & drop files here, or click to select files'
//                 }
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">Max file size: 25MB</p>
//             </div>

//             {/* Attachment list */}
//             {attachments.length > 0 && (
//                 <div className="mt-4 space-y-2">
//                 {attachments.map(attachment => (
//                     <div
//                     key={attachment.id}
//                     className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                     >
//                     <div className="flex items-center gap-3">
//                         <Paperclip className="h-4 w-4 text-gray-400" />
//                         <div>
//                         <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
//                         <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
//                         </div>
//                     </div>
//                     <button
//                         type="button"
//                         onClick={() => removeAttachment(attachment.id)}
//                         className="text-red-600 hover:text-red-700"
//                     >
//                         <X className="h-4 w-4" />
//                     </button>
//                     </div>
//                 ))}
//                 </div>
//             )}
//             </div>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//             {/* Recipients */}
//             <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Recipients</h2>
            
//             <div className="space-y-4">
//                 <div className="space-y-2">
//                 <label className="flex items-center">
//                     <input
//                     type="radio"
//                     {...register('recipientType')}
//                     value="single"
//                     className="mr-2 text-blue-600"
//                     />
//                     <User className="h-4 w-4 mr-1" />
//                     Single recipient
//                 </label>
//                 <label className="flex items-center">
//                     <input
//                     type="radio"
//                     {...register('recipientType')}
//                     value="list"
//                     className="mr-2 text-blue-600"
//                     />
//                     <Mail className="h-4 w-4 mr-1" />
//                     Mailing list
//                 </label>
//                 <label className="flex items-center">
//                     <input
//                     type="radio"
//                     {...register('recipientType')}
//                     value="upload"
//                     className="mr-2 text-blue-600"
//                     />
//                     <Paperclip className="h-4 w-4 mr-1" />
//                     Upload CSV/Excel
//                 </label>
//                 </div>

//                 {recipientType === 'single' && (
//                 <input
//                     type="email"
//                     {...register('recipients')}
//                     placeholder="Enter email address"
//                     className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                 />
//                 )}

//                 {recipientType === 'list' && (
//                 <select
//                     {...register('recipients')}
//                     className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                 >
//                     <option value="">Select a list</option>
//                     <option value="newsletter">Newsletter Subscribers (2,458)</option>
//                     <option value="customers">Customers (1,234)</option>
//                     <option value="prospects">Prospects (856)</option>
//                 </select>
//                 )}

//                 {recipientType === 'upload' && (
//                 <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
//                     <p className="text-sm text-gray-600">
//                     Upload CSV or Excel file
//                     </p>

//                     <input
//                     type="file"
//                     accept=".csv,.xlsx,.xls"
//                     className="hidden"
//                     id="recipient-file"
//                     onChange={(e) => {
//                         if (e.target.files && e.target.files[0]) {
//                         setRecipientFile(e.target.files[0]);
//                         }
//                     }}
//                     />

//                     <label
//                     htmlFor="recipient-file"
//                     className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
//                     >
//                     Choose file
//                     </label>

//                     {recipientFile && (
//                     <p className="mt-2 text-xs text-gray-500">
//                         Selected: <strong>{recipientFile.name}</strong>
//                     </p>
//                     )}
//                 </div>
//                 )}

//             </div>
//             </div>

//             {/* Schedule */}
//             <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
//                 <button
//                 type="button"
//                 onClick={() => setIsScheduling(!isScheduling)}
//                 className="text-sm text-blue-600 hover:text-blue-700"
//                 >
//                 {isScheduling ? 'Send now' : 'Schedule'}
//                 </button>
//             </div>

//             {isScheduling && (
//                 <div className="space-y-4">
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Date
//                     </label>
//                     <input
//                     type="date"
//                     {...register('scheduleDate')}
//                     className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     />
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Time
//                     </label>
//                     <input
//                     type="time"
//                     {...register('scheduleTime')}
//                     className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                     />
//                 </div>
//                 </div>
//             )}
//             </div>

//             {/* Actions */}
//             <div className="space-y-3">
//             <button
//                 type="button"
//                 onClick={handlePreview}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
//             >
//                 <Eye className="h-4 w-4" />
//                 Preview
//             </button>
            
//             <button
//                 type="button"
//                 onClick={handleTestSend}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 font-medium transition-colors"
//             >
//                 <TestTube className="h-4 w-4" />
//                 Test Send
//             </button>
            
//             <button
//                 type="submit"
//                 className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
//             >
//                 {isScheduling ? <Calendar className="h-4 w-4" /> : <Send className="h-4 w-4" />}
//                 {isScheduling ? 'Schedule Email' : 'Send Email'}
//             </button>
//             </div>
//         </div>
//         </div>
//     </form>
//     </div>
// );
// }








// const onSubmit = async (data: ComposeForm) => {
// if (!editor) return;

// // 🚨 CSV requires multipart/form-data
// if (data.recipientType === 'upload') {
//     if (!recipientFile) {
//     alert('Please upload CSV/Excel file');
//     return;
//     }

//     const formData = new FormData();

//     formData.append('subject', data.subject);
//     formData.append('from_name', data.fromName);
//     formData.append('from_email', data.fromEmail);
//     formData.append('reply_to', data.replyTo);
//     formData.append('body', editor.getHTML());

//     formData.append('recipient_type', 'upload');
//     formData.append('recipient_file', recipientFile); // ✅ Actual file

//     // ⏰ Schedule
//     if (isScheduling) {
//     if (!data.scheduleDate || !data.scheduleTime) {
//         alert('Please select date & time');
//         return;
//     }
//     formData.append('schedule_date', formatDate(data.scheduleDate)!);
//     formData.append('schedule_time', formatTime(data.scheduleTime)!);
//     }

//     const response = await fetch('http://127.0.0.1:8000/api/send_email/', {
//     method: 'POST',
//     body: formData, // ❗ No headers
//     });

//     const result = await response.json();
//     if (!response.ok) {
//     throw new Error(result.error || 'Failed to send email');
//     }

//     alert('CSV email sent successfully ✅');
//     return;
// }

// // 🟢 NON-CSV → JSON payload
// const payload: EmailPayload = {
//     subject: data.subject,
//     from_name: data.fromName,
//     from_email: data.fromEmail,
//     reply_to: data.replyTo,
//     body: editor.getHTML(),
//     attachments, // Include attachments
//     recipients:
//     data.recipientType === 'single'
//         ? { type: 'single recipient', email: data.recipients }
//         : { type: 'list', value: data.recipients },
// };

// // ⏰ Add schedule if selected
// if (isScheduling) {
//     payload.schedule = {
//     date: formatDate(data.scheduleDate),
//     time: formatTime(data.scheduleTime),
//     };
// }

// try {
//     const response = await fetch('http://127.0.0.1:8000/api/send_email/', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//     });

//     const result = await response.json();
//     if (!response.ok) {
//     throw new Error(result.error || 'Failed to send email');
//     }

//     alert(isScheduling ? 'Email scheduled successfully ✅' : 'Email sent successfully ✅');
// } catch (error: any) {
//     console.error('Email send error:', error);
//     alert(error.message || 'Something went wrong ❌');
// }
// };



//       // ⏰ Schedule
//       if (isScheduling) {
//         if (!data.scheduleDate || !data.scheduleTime) {
//           alert('Please select date & time');
//           return;
//         }
//         formData.append('schedule_date', formatDate(data.scheduleDate)!);
//         formData.append('schedule_time', formatTime(data.scheduleTime)!);
//       }