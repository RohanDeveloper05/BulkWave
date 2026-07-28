// components/ComposeSidebar.tsx
import { useFormContext } from 'react-hook-form';
import clsx from 'clsx';
import { Eye, TestTube, Send, Calendar, Loader2, User, Mail } from 'lucide-react';
import { ComposeForm } from '../types';

interface SidebarProps {
    isScheduling: boolean;
    setIsScheduling: (val: boolean) => void;
    isSending: boolean;
    handlePreview: () => void;
    handleTestSend: () => void;
    emailLists: any[];
    loadingLists: boolean;
}

export default function ComposeSidebar({
    isScheduling,
    setIsScheduling,
    isSending,
    handlePreview,
    handleTestSend,
    emailLists,
    loadingLists,
    }: SidebarProps) {
    const { register, watch, setValue, formState: { errors } } = useFormContext<ComposeForm>();
    const recipientType = watch('recipientType');

    return (
        <div className="space-y-6">
        {/* Campaign Selection */}
        <div className="campaign-settings-card">
            <div className="campaign-settings-header">
            <div>
                <h2 className="campaign-settings-title">
                Campaign Settings
                </h2>
                <p className="campaign-settings-subtitle">
                Organize this email under a campaign for better tracking
                </p>
            </div>
            <button
                type="button"
                onClick={() => setValue("isCampaign", !watch("isCampaign"))}
                className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition",
                watch("isCampaign") ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-600"
                )}
            >
                <span
                className={clsx(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition",
                    watch("isCampaign") ? "translate-x-6" : "translate-x-1"
                )}
                />
            </button>
            </div>

            {/* Expandable Campaign Box */}
            <div className="compose-card campaign-card">
                <div className="compose-card-header">
                    <div>
                    <span className="compose-badge">Campaign</span>
                    <h2 className="compose-title">Campaign Settings</h2>
                    <p className="compose-subtitle">Group this email into a campaign for analytics.</p>
                    </div>
                </div>
                
                <div className={clsx("campaign-status", watch("isCampaign") ? "campaign-status-active" : "campaign-status-disabled")}>
                    <div className="campaign-status-dot" />
                    <div>
                    <p className="campaign-status-title">
                        {watch("isCampaign") ? "Campaign Enabled" : "Campaign Disabled"}
                    </p>
                    <p className="campaign-status-text">
                        {watch("isCampaign") ? "Emails will be grouped under one campaign." : "Emails will be sent without tracking."}
                    </p>
                    </div>
                </div>

                {watch("isCampaign") && (
                    <div className="campaign-body">
                    <div className="compose-field">
                        <label className="compose-label">Campaign Name</label>
                        <input
                        type="text"
                        {...register("campaignName", { required: watch("isCampaign") ? "Required" : false })}
                        placeholder="Summer Sale 2026"
                        className="compose-input"
                        />
                        {errors.campaignName && <p className="compose-error">{errors.campaignName.message}</p>}
                    </div>

                    <div className="compose-field">
                        <label className="compose-label">Description</label>
                        <textarea
                        rows={4}
                        {...register("campaignDescription")}
                        placeholder="Write a short description..."
                        className="compose-textarea"
                        />
                    </div>
                    </div>
                )}
            </div>
        </div>

        {/* Recipients Selection */}
        <div className="compose-card recipient-card">
            <div className="compose-card-header">
            <div>
                <span className="compose-badge">Recipients</span>
                <h2 className="compose-title">Choose Recipients</h2>
                <p className="compose-subtitle">Send to an individual contact or a list.</p>
            </div>
            </div>
            
            <div className="recipient-options">
                <label className={clsx("recipient-option", recipientType === "single" && "recipient-option-active")}>
                    <input type="radio" {...register("recipientType")} value="single" className="hidden" />
                    <User className="recipient-icon" />
                    <div>
                        <h4>Single Recipient</h4>
                        <p>Send to one email address</p>
                    </div>
                </label>
                <label className={clsx("recipient-option", recipientType === "list" && "recipient-option-active")}>
                    <input type="radio" {...register("recipientType")} value="list" className="hidden" />
                    <Mail className="recipient-icon" />
                    <div>
                        <h4>Mailing List</h4>
                        <p>Send to saved contacts</p>
                    </div>
                </label>
            </div>

            {recipientType === "single" && (
            <div className="recipient-body">
                <div className="compose-field">
                <label className="compose-label">Recipient Name</label>
                <input type="text" {...register("firstName", { required: "Required" })} placeholder="John Doe" className="compose-input" />
                {errors.firstName && <p className="compose-error">{errors.firstName.message}</p>}
                </div>
                <div className="compose-field">
                <label className="compose-label">Email Address</label>
                <input type="email" {...register("recipients", { required: "Required" })} placeholder="john@example.com" className="compose-input" />
                {errors.recipients && <p className="compose-error">{errors.recipients.message}</p>}
                </div>
            </div>
            )}

            {recipientType === "list" && (
            <div className="recipient-body">
                <div className="compose-field">
                <label className="compose-label">Mailing List</label>
                <select {...register("recipients")} className="compose-select">
                    <option value="">{loadingLists ? "Loading Lists..." : "Select Mailing List"}</option>
                    {emailLists.length === 0 && !loadingLists && <option disabled>No lists available</option>}
                    {emailLists.map((list) => (
                    <option key={list.id} value={list.list_name}>{list.list_name}</option>
                    ))}
                </select>
                </div>
            </div>
            )}
        </div>

        {/* Schedule Box */}
        <div className="schedule-box-card">
            <div className="schedule-box-header">
                <h2 className="schedule-box-title">Schedule</h2>
                <button 
                type="button" 
                onClick={() => setIsScheduling(!isScheduling)} 
                className="schedule-toggle-btn"
                >
                {isScheduling ? 'Send now' : 'Schedule'}
                </button>
            </div>
            
            {isScheduling && (
                <div className="schedule-inputs-wrapper">
                <div>
                    <label className="schedule-label">Date</label>
                    <input 
                    type="date" 
                    {...register('scheduleDate')} 
                    className="schedule-input" 
                    />
                </div>
                <div>
                    <label className="schedule-label">Time</label>
                    <input 
                    type="time" 
                    {...register('scheduleTime')} 
                    className="schedule-input" 
                    />
                </div>
                </div>
            )}
        </div>

        {/* Actions */}
        <div className="action-buttons-wrapper">
            <button 
                type="button" 
                onClick={handlePreview} 
                className="action-btn btn-preview"
            >
                <Eye className="action-icon" /> Preview
            </button>
            
            <button 
                type="button" 
                onClick={handleTestSend} 
                disabled={isSending} 
                className={clsx("action-btn btn-test", isSending && "btn-disabled")}
            >
                <TestTube className="action-icon" /> Test Send
            </button>
            
            <button 
                type="submit" 
                disabled={isSending} 
                className={clsx("action-btn btn-submit", isSending && "btn-submit-disabled")}
            >
                {isSending ? (
                <>
                    <Loader2 className="action-icon animate-spin" /> Sending...
                </>
                ) : (
                <>
                    {isScheduling ? <Calendar className="action-icon" /> : <Send className="action-icon" />} 
                    {isScheduling ? 'Schedule Email' : 'Send Email'}
                </>
                )}
            </button>
        </div>
        </div>
    );
}