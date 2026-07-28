import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import clsx from 'clsx';
import { Bold, Italic, List, ListOrdered, Loader2 } from 'lucide-react';
import '../../styles/Compose.css';

// Component/Type Imports
import { ComposeForm } from '../types';
import ComposeAttachments from './ComposeAttachments';
import ComposeSidebar from './ComposeSidebar';

// API Imports (Maintain your precise original paths here)
import { fetchAttachmentNames, listTemplateNames, sendEmail, fetchListsByEmail } from "../../api/recipients";

const senderProfiles = [
  { id: 1, name: 'Marketing Team', email: 'marketing@company.com' },
  { id: 2, name: 'Support Team', email: 'support@company.com' },
  { id: 3, name: 'Sales Team', email: 'sales@company.com' },
  { id: 4, name: 'Testing', email: 'info-it@rohankumar.online' },
  { id: 5, name: 'NRI', email: 'nridesk@sharesamadhan.com' },
  { id: 7, name: 'Pratikshy Gmail', email: 'pratikshya7890.ss@gmail.com' },
];

const personalizationVariables = [
  { label: 'First Name', value: '{{vh_first_name}}' },
  { label: 'Last Name', value: '{{vh_last_name}}' },
  { label: 'Email', value: '{{vh_email}}' },
  { label: 'Company', value: '{{vh_company}}' },
];

const formatDate = (date?: string) => {
  if (!date) return null;
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};

const formatTime = (time?: string) => {
  if (!time) return null;
  const [h, m] = time.split(':');
  let hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
};

export default function Compose() {
  const methods = useForm<ComposeForm>({
    defaultValues: {
      recipientType: 'single',
      fromName: 'Marketing Team',
      fromEmail: 'info-it@rohankumar.online',
      replyTo: 'samadhan@sharesamadhan.com'
    }
  });

  const { register, handleSubmit, watch, formState: { errors } } = methods;
  const selectedFromEmail = watch('fromEmail');

  const [uploadedAttachments, setUploadedAttachments] = useState<File[]>([]);
  const [selectedAttachmentNames, setSelectedAttachmentNames] = useState<string[]>([]);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [recipientFile] = useState<File | null>(null);
  
  const [preloadedAttachments, setPreloadedAttachments] = useState<string[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  const [emailMode, setEmailMode] = useState<'editor' | 'template'>('editor');
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateCount, setTemplateCount] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [emailLists, setEmailLists] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start writing your email content here...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4 dark:prose-invert'
      }
    }
  });

  useEffect(() => {
    const loadAttachments = async () => {
      try {
        setLoadingAttachments(true);
        const names = await fetchAttachmentNames();
        setPreloadedAttachments(names);
      } catch (err) {
        console.error("Failed to load attachments", err);
      } finally { setLoadingAttachments(false); }
    };
    loadAttachments();
  }, []);

  useEffect(() => {
    if (emailMode !== 'template') return;
    const loadTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const res = await listTemplateNames(selectedFromEmail);
        if (res.success) {
          setTemplates(res.data);
          setTemplateCount(res.count);
          setSelectedTemplate('');
        }
      } catch (err) {
        console.error("Failed to load templates", err);
      } finally { setLoadingTemplates(false); }
    };
    loadTemplates();
  }, [emailMode, selectedFromEmail]);

  useEffect(() => {
    if (!selectedFromEmail) return;
    const loadLists = async () => {
      try {
        setLoadingLists(true);
        const res = await fetchListsByEmail(selectedFromEmail);
        if (res) setEmailLists(res.lists || []);
      } catch (err) {
        console.error(err);
      } finally { setLoadingLists(false); }
    };
    loadLists();
  }, [selectedFromEmail]);

  const insertPersonalization = (variable: string) => {
    if (editor) editor.chain().focus().insertContent(variable).run();
    setShowPersonalization(false);
  };

  const onSubmit = async (data: ComposeForm) => {
    if (!editor || isSending) return;
    setIsSending(true);

    try {
      if (data.isCampaign && !data.campaignName) {
        alert("Campaign name is required");
        return;
      }

      let selectedTemplateData = null;
      if (emailMode === "template") {
        selectedTemplateData = templates.find((t) => String(t.id) === selectedTemplate);
        if (!selectedTemplateData) return alert("Please select a template");
      }

      const hasFiles = data.recipientType === "upload" || uploadedAttachments.length > 0 || selectedAttachmentNames.length > 0;

      if (hasFiles) {
        const formData = new FormData();
        formData.append("subject", data.subject);
        formData.append("from_name", data.fromName);
        formData.append("from_email", data.fromEmail);
        formData.append("reply_to", data.replyTo || "");
        formData.append("recipient_type", data.recipientType);

        if (data.recipientType === "single") {
          formData.append("recipients", data.recipients);
          formData.append("first_name", data.firstName || "");
        } else if (data.recipientType === "list") {
          formData.append("recipients", data.recipients);
        } else if (data.recipientType === "upload" && recipientFile) {
          formData.append("recipient_file", recipientFile);
        }

        uploadedAttachments.forEach((f) => formData.append("attachment_files", f));
        selectedAttachmentNames.forEach((n) => formData.append("attachment_names", n));

        if (emailMode === "template") {
          formData.append("email_format", "HTML");
          formData.append("email_template", selectedTemplateData!.template_name);
        } else {
          formData.append("email_format", "TEXT");
          formData.append("email_text", editor.getText());
        }

        if (isScheduling) {
          formData.append("schedule_date", formatDate(data.scheduleDate)!);
          formData.append("schedule_time", formatTime(data.scheduleTime)!);
        }

        formData.append("is_campaign", String(!!data.isCampaign));
        if (data.isCampaign) {
          formData.append("campaign_name", data.campaignName || "");
          formData.append("campaign_description", data.campaignDescription || "");
        }

        await sendEmail(formData);
        alert(isScheduling ? "Email scheduled ✅" : "Email sent ✅");
        return;
      }

      // JSON API approach if no files
      const payload: any = {
        subject: data.subject,
        from_name: data.fromName,
        from_email: data.fromEmail,
        reply_to: data.replyTo || "",
        recipient_type: data.recipientType,
        is_campaign: !!data.isCampaign,
        campaign_name: data.isCampaign ? data.campaignName : null,
        campaign_description: data.isCampaign ? data.campaignDescription : null,
      };

      if (data.recipientType === "single") {
        payload.recipients = data.recipients;
        payload.first_name = data.firstName || "";
      } else if (data.recipientType === "list") {
        payload.recipients = data.recipients;
      }

      if (emailMode === "template") {
        payload.email_format = "HTML";
        payload.email_template = selectedTemplateData!.template_name;
      } else {
        payload.email_format = "TEXT";
        payload.email_text = editor.getText();
      }

      if (isScheduling) {
        payload.schedule_date = formatDate(data.scheduleDate)!;
        payload.schedule_time = formatTime(data.scheduleTime)!;
      }

      await sendEmail(payload);
      alert(isScheduling ? "Email scheduled ✅" : "Email sent ✅");
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || "Failed to send email ❌");
    } finally {
      setIsSending(false);
    }
  };

  const handlePreview = () => {
    if (!editor) return;
    const values = watch();
    if (!values.subject) return alert("Subject is required");

    let htmlContent = editor.getHTML();
    if (emailMode === "template") {
      const template = templates.find(t => String(t.id) === selectedTemplate);
      if (!template) return alert("Please select a template");
      htmlContent = template.html.includes("<html") ? template.html : `<html><head><style>${template.css || ""}</style></head><body>${template.html}<script>${template.js || ""}</script></body></html>`;
    }

    const previewData = {
      subject: values.subject,
      fromName: values.fromName,
      fromEmail: values.fromEmail,
      replyTo: values.replyTo,
      body: htmlContent,
      date: new Date().toLocaleString(),
    };
    localStorage.setItem("emailPreviewData", JSON.stringify(previewData));
    window.open("/email-preview", "_blank");
  };

  const handleTestSend = () => console.log('Send test email');

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <div className="compose-header">
          <div>
            <h1 className="dashboard-title dark:text-white">Compose Email</h1>
            <p className="dashboard-subtitle dark:text-gray-400">Create and send your email campaign</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            {/* LEFT SIDE CONTENT */}
            <div className="lg:col-span-2 space-y-7">
              {/* DETAILS BOX */}
              <div className="dashboard-card compose-card-main email-details-card">
                <div className="compose-card-main-header">
                  <div>
                    <h2 className="compose-card-main-title">Email Details</h2>
                    <p className="compose-card-main-subtitle">Configure sender information</p>
                  </div>
                </div>
                
                <div className="email-details-body">
                  <div>
                    <label className="compose-label">Subject Line *</label>
                    <input 
                      type="text" 
                      {...register("subject", { required: "Subject is required" })} 
                      className="compose-input" 
                      placeholder="Enter email subject" 
                    />
                    {errors.subject && <p className="compose-error">{errors.subject.message}</p>}
                  </div>
                  
                  <div className="email-details-row">
                    <div>
                      <label className="compose-label">From Name</label>
                      <input 
                        type="text" 
                        {...register("fromName")} 
                        className="compose-input" 
                        placeholder="Company Name" 
                      />
                    </div>
                    <div>
                      <label className="compose-label">From Email</label>
                      <div className="dashboard-select-wrapper">
                        <select {...register("fromEmail")} className="dashboard-select compose-select">
                          {senderProfiles.map((p) => (
                            <option key={p.id} value={p.email}>{p.email}</option>
                          ))}
                        </select>
                        <span className="dashboard-select-arrow">⌄</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="compose-label">Reply-To Email</label>
                    <input 
                      type="email" 
                      {...register("replyTo")} 
                      className="compose-input" 
                      placeholder="support@example.com" 
                    />
                  </div>
                </div>
              </div>

              {/* MODE SELECTION */}
              <div className="grid md:grid-cols-2 gap-5">
                <div onClick={() => setEmailMode("editor")} className={clsx("compose-mode-card", emailMode === "editor" && "compose-mode-active")}>
                  <div className="compose-mode-top">
                    <h3>Write Email</h3>
                    {emailMode === "editor" && <span className="compose-badge">Active</span>}
                  </div>
                  <p>Build your email manually using the rich text editor.</p>
                </div>
                <div onClick={() => setEmailMode("template")} className={clsx("compose-mode-card", emailMode === "template" && "compose-mode-active")}>
                  <div className="compose-mode-top">
                    <h3>Use Template</h3>
                    {emailMode === "template" && <span className="compose-badge">Active</span>}
                  </div>
                  <p>Select one of your professionally designed templates.</p>
                </div>
              </div>

              {/* EDITOR/TEMPLATE RENDER */}
              <div className="dashboard-card compose-card-main overflow-hidden">
                <div className="compose-content-header">
                  <div>
                    <h2 className="compose-card-main-title">Email Content</h2>
                    <p className="compose-card-main-subtitle">Design your email using the editor or templates</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {emailMode === "template" && (
                      <div className="compose-template-count">{templateCount} Template(s)</div>
                    )}
                    {emailMode === "editor" && (
                      <button type="button" onClick={() => setShowPersonalization(!showPersonalization)} className="dashboard-button dark:bg-slate-700 dark:text-white">Variables</button>
                    )}
                  </div>
                </div>

                {emailMode === "template" ? (
                  <div className="p-6">
                    {loadingTemplates ? <div className="compose-empty">Loading templates...</div> : 
                      templates.length === 0 ? <div className="compose-empty">No templates available</div> : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {templates.map((t) => (
                          <div key={t.id} onClick={() => setSelectedTemplate(String(t.id))} className={clsx("compose-template-card", selectedTemplate === String(t.id) && "compose-template-card-active")}>
                            <div className="compose-template-preview">
                              <iframe title="preview" className="compose-template-frame" srcDoc={t.html.includes("<html") ? t.html : `<html><head><style>body{margin:0;font-family:sans-serif;} ${t.css || ""}</style></head><body>${t.html || ""}<script>${t.js || ""}</script></body></html>`} />
                              <div className="compose-template-overlay" />
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <h4 className="compose-template-name">{t.template_name}</h4>
                              {selectedTemplate === String(t.id) && <span className="compose-badge">Selected</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {editor && (
                      <div className="compose-editor-toolbar">
                        {[{ icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
                          { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
                          { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
                          { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") }
                        ].map((btn, i) => (
                          <button key={i} type="button" onClick={btn.action} className={clsx("compose-toolbar-btn", btn.active && "compose-toolbar-btn-active")}>
                            <btn.icon size={17} />
                          </button>
                        ))}
                      </div>
                    )}
                    {showPersonalization && (
                      <div className="compose-variable-box">
                        <p className="compose-variable-title">Personalization Variables</p>
                        <div className="flex flex-wrap gap-2">
                          {personalizationVariables.map(v => (
                            <button key={v.value} type="button" onClick={() => insertPersonalization(v.value)} className="compose-variable-chip dark:bg-slate-700 dark:text-white dark:border-slate-600">
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="compose-editor">
                      <EditorContent editor={editor} />
                    </div>
                  </>
                )}
              </div>

              {/* ATTACHMENTS SUB-COMPONENT */}
              <ComposeAttachments 
                uploadedAttachments={uploadedAttachments} 
                setUploadedAttachments={setUploadedAttachments}
                selectedAttachmentNames={selectedAttachmentNames}
                setSelectedAttachmentNames={setSelectedAttachmentNames}
                preloadedAttachments={preloadedAttachments}
                loadingAttachments={loadingAttachments}
              />
            </div>

            {/* SIDEBAR COMPONENT */}
            <ComposeSidebar 
              isScheduling={isScheduling}
              setIsScheduling={setIsScheduling}
              isSending={isSending}
              handlePreview={handlePreview}
              handleTestSend={handleTestSend}
              emailLists={emailLists}
              loadingLists={loadingLists}
            />
          </div>
        </form>

        {isSending && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl px-8 py-6 shadow-xl flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sending email...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Please wait and do not close this page</p>
            </div>
          </div>
        )}
      </div>
    </FormProvider>
  );
}