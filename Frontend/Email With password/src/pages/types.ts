// types.ts
export interface ComposeForm {
    subject: string;
    fromName: string;
    fromEmail: string;
    replyTo: string;
    recipientType: 'single' | 'list' | 'upload';
    
    recipients: string;
    firstName?: string;

    scheduleDate?: string;
    scheduleTime?: string;

    isCampaign?: boolean;
    campaignName?: string;
    campaignDescription?: string;
}