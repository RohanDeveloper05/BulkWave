import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Server, User, Webhook, CheckCircle, Eye, EyeOff, Plus, Trash2, CreditCard as Edit } from 'lucide-react';
import clsx from 'clsx';

interface EmailProviderForm {
  providerType: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
}

interface SenderProfile {
  id: number;
  name: string;
  email: string;
  replyTo: string;
  isDefault: boolean;
}

interface WebhookForm {
  url: string;
  events: string[];
  secret: string;
}

const mockSenderProfiles: SenderProfile[] = [
  {
    id: 1,
    name: 'Marketing Team',
    email: 'marketing@company.com',
    replyTo: 'marketing@company.com',
    isDefault: true
  },
  {
    id: 2,
    name: 'Support Team',
    email: 'support@company.com',
    replyTo: 'support@company.com',
    isDefault: false
  },
  {
    id: 3,
    name: 'Sales Team',
    email: 'sales@company.com',
    replyTo: 'sales@company.com',
    isDefault: false
  }
];

const webhookEvents = [
  { id: 'delivered', label: 'Email Delivered', description: 'Email was successfully delivered' },
  { id: 'opened', label: 'Email Opened', description: 'Recipient opened the email' },
  { id: 'clicked', label: 'Link Clicked', description: 'Recipient clicked a link in the email' },
  { id: 'bounced', label: 'Email Bounced', description: 'Email bounced back' },
  { id: 'spam', label: 'Marked as Spam', description: 'Email was marked as spam' },
  { id: 'unsubscribed', label: 'Unsubscribed', description: 'Recipient unsubscribed' }
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'provider' | 'senders' | 'webhooks' | 'system'>('provider');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [senderProfiles, setSenderProfiles] = useState<SenderProfile[]>(mockSenderProfiles);
  const [editingSender, setEditingSender] = useState<SenderProfile | null>(null);

  const providerForm = useForm<EmailProviderForm>({
    defaultValues: {
      providerType: 'sendgrid',
      smtpPort: 587,
      smtpSecure: true
    }
  });

  const webhookForm = useForm<WebhookForm>({
    defaultValues: {
      events: ['delivered', 'opened', 'clicked', 'bounced']
    }
  });

  const watchedProviderType = providerForm.watch('providerType');
  const watchedWebhookEvents = webhookForm.watch('events');

  const onProviderSubmit = (data: EmailProviderForm) => {
    console.log('Provider settings:', data);
    // Handle provider settings save
  };

  const onWebhookSubmit = (data: WebhookForm) => {
    console.log('Webhook settings:', data);
    // Handle webhook settings save
  };

  const handleSenderSave = (sender: Partial<SenderProfile>) => {
    if (editingSender) {
      setSenderProfiles(profiles =>
        profiles.map(p => p.id === editingSender.id ? { ...p, ...sender } : p)
      );
    } else {
      const newSender: SenderProfile = {
        id: Date.now(),
        name: sender.name || '',
        email: sender.email || '',
        replyTo: sender.replyTo || sender.email || '',
        isDefault: false
      };
      setSenderProfiles(profiles => [...profiles, newSender]);
    }
    setEditingSender(null);
  };

  const handleSetDefault = (id: number) => {
    setSenderProfiles(profiles =>
      profiles.map(p => ({ ...p, isDefault: p.id === id }))
    );
  };

  const handleDeleteSender = (id: number) => {
    setSenderProfiles(profiles => profiles.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Configure your email marketing platform</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'provider', name: 'Email Provider', icon: Mail },
            { id: 'senders', name: 'Sender Profiles', icon: User },
            { id: 'webhooks', name: 'Webhooks', icon: Webhook },
            { id: 'system', name: 'System', icon: Server }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Email Provider Tab */}
      {activeTab === 'provider' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Email Provider Configuration</h2>
            </div>

            <form onSubmit={providerForm.handleSubmit(onProviderSubmit)} className="space-y-6">
              {/* Provider Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Email Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'sendgrid', label: 'SendGrid' },
                    { value: 'mailgun', label: 'Mailgun' },
                    { value: 'ses', label: 'Amazon SES' },
                    { value: 'smtp', label: 'Custom SMTP' }
                  ].map((provider) => (
                    <label
                      key={provider.value}
                      className={clsx(
                        'relative flex cursor-pointer rounded-lg p-4 border transition-colors',
                        watchedProviderType === provider.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <input
                        type="radio"
                        {...providerForm.register('providerType')}
                        value={provider.value}
                        className="sr-only"
                      />
                      <div className="flex-1 text-sm font-medium text-gray-900">
                        {provider.label}
                      </div>
                      {watchedProviderType === provider.value && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* API Key Configuration */}
              {['sendgrid', 'mailgun', 'ses'].includes(watchedProviderType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      {...providerForm.register('apiKey', { required: 'API Key is required' })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                      placeholder="Enter your API key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {providerForm.formState.errors.apiKey && (
                    <p className="mt-1 text-sm text-red-600">
                      {providerForm.formState.errors.apiKey.message}
                    </p>
                  )}
                </div>
              )}

              {/* SMTP Configuration */}
              {watchedProviderType === 'smtp' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        {...providerForm.register('smtpHost', { required: 'SMTP Host is required' })}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Port
                      </label>
                      <input
                        type="number"
                        {...providerForm.register('smtpPort', { required: 'Port is required' })}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      {...providerForm.register('smtpUsername', { required: 'Username is required' })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="your-email@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password / App Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSmtpPassword ? 'text' : 'password'}
                        {...providerForm.register('smtpPassword', { required: 'Password is required' })}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                        placeholder="Your app password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showSmtpPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...providerForm.register('smtpSecure')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Use secure connection (TLS/SSL)
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Configuration
                </button>
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Test Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sender Profiles Tab */}
      {activeTab === 'senders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sender Profiles</h2>
              <p className="text-gray-600">Manage sender information for your campaigns</p>
            </div>
            <button
              onClick={() => setEditingSender({} as SenderProfile)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {senderProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200 relative"
              >
                {profile.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Default
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">From Email</p>
                    <p className="text-sm font-medium text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reply-To Email</p>
                    <p className="text-sm font-medium text-gray-900">{profile.replyTo}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setEditingSender(profile)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4 mx-auto" />
                  </button>
                  {!profile.isDefault && (
                    <>
                      <button
                        onClick={() => handleSetDefault(profile.id)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Set Default
                      </button>
                      <button
                        onClick={() => handleDeleteSender(profile.id)}
                        className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Edit Sender Modal */}
          {editingSender && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingSender.id ? 'Edit Sender Profile' : 'Add Sender Profile'}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSenderSave({
                      name: formData.get('name') as string,
                      email: formData.get('email') as string,
                      replyTo: formData.get('replyTo') as string
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingSender.name}
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingSender.email}
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reply-To Email
                    </label>
                    <input
                      type="email"
                      name="replyTo"
                      defaultValue={editingSender.replyTo}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingSender(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Webhook className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Webhook Configuration</h2>
                <p className="text-sm text-gray-600">Receive real-time notifications about email events</p>
              </div>
            </div>

            <form onSubmit={webhookForm.handleSubmit(onWebhookSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  {...webhookForm.register('url', { required: 'Webhook URL is required' })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://your-domain.com/webhook"
                />
                {webhookForm.formState.errors.url && (
                  <p className="mt-1 text-sm text-red-600">
                    {webhookForm.formState.errors.url.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Events to Subscribe
                </label>
                <div className="space-y-3">
                  {webhookEvents.map((event) => (
                    <label key={event.id} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        value={event.id}
                        {...webhookForm.register('events')}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked={watchedWebhookEvents.includes(event.id)}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.label}</div>
                        <div className="text-sm text-gray-600">{event.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Secret
                </label>
                <input
                  type="text"
                  {...webhookForm.register('secret')}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Optional secret for webhook verification"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Used to verify webhook authenticity (recommended)
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Webhook
                </button>
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Test Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Server className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Rate Limiting</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emails per minute
                    </label>
                    <input
                      type="number"
                      defaultValue="60"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Concurrent sends
                    </label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tracking Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable open tracking</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable click tracking</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Track user agent information</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Security</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Encrypt sensitive data at rest</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable API rate limiting</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Require two-factor authentication</span>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save System Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}