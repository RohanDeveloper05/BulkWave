import { useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Search,
  Eye,
  MousePointer,
  Send,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Campaign {
  id: number;
  name: string;
  subject: string;
  sentAt: string;
  recipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  status: 'completed' | 'sending' | 'scheduled' | 'draft';
}

interface CampaignEvent {
  id: number;
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  recipient: string;
  timestamp: string;
  metadata?: any;
}

const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: 'Summer Sale Newsletter',
    subject: '🏖️ Summer Sale - Up to 50% Off!',
    sentAt: '2024-01-15T10:00:00Z',
    recipients: 2500,
    sent: 2500,
    delivered: 2485,
    opened: 1250,
    clicked: 485,
    bounced: 15,
    unsubscribed: 8,
    status: 'completed'
  },
  {
    id: 2,
    name: 'Product Update Alert',
    subject: 'New Features in Our Latest Update',
    sentAt: '2024-01-14T14:30:00Z',
    recipients: 1800,
    sent: 1800,
    delivered: 1795,
    opened: 920,
    clicked: 340,
    bounced: 5,
    unsubscribed: 3,
    status: 'completed'
  },
  {
    id: 3,
    name: 'Welcome Series - Part 3',
    subject: 'Getting the most out of your account',
    sentAt: '2024-01-13T09:15:00Z',
    recipients: 450,
    sent: 450,
    delivered: 448,
    opened: 285,
    clicked: 125,
    bounced: 2,
    unsubscribed: 1,
    status: 'completed'
  }
];

const mockCampaignEvents: CampaignEvent[] = [
  {
    id: 1,
    type: 'sent',
    recipient: 'john.doe@example.com',
    timestamp: '2024-01-15T10:00:01Z'
  },
  {
    id: 2,
    type: 'delivered',
    recipient: 'john.doe@example.com',
    timestamp: '2024-01-15T10:00:15Z'
  },
  {
    id: 3,
    type: 'opened',
    recipient: 'john.doe@example.com',
    timestamp: '2024-01-15T10:30:22Z'
  },
  {
    id: 4,
    type: 'clicked',
    recipient: 'john.doe@example.com',
    timestamp: '2024-01-15T10:32:45Z',
    metadata: { url: 'https://example.com/product' }
  }
];

export default function Reports() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignEvents] = useState<CampaignEvent[]>(mockCampaignEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const calculateRate = (numerator: number, denominator: number) => {
    return denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : '0.0';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'delivered':
        return <TrendingUp className="h-4 w-4" />;
      case 'opened':
        return <Eye className="h-4 w-4" />;
      case 'clicked':
        return <MousePointer className="h-4 w-4" />;
      case 'bounced':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'sent':
        return 'text-blue-600 bg-blue-50';
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'opened':
        return 'text-purple-600 bg-purple-50';
      case 'clicked':
        return 'text-orange-600 bg-orange-50';
      case 'bounced':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (selectedCampaign) {
    return (
      <div className="space-y-6">
        {/* Back to campaigns */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedCampaign(null)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Reports
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedCampaign.name}</h1>
            <p className="mt-2 text-gray-600">Detailed campaign performance</p>
          </div>
        </div>

        {/* Campaign stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calculateRate(selectedCampaign.delivered, selectedCampaign.sent)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calculateRate(selectedCampaign.opened, selectedCampaign.delivered)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <MousePointer className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calculateRate(selectedCampaign.clicked, selectedCampaign.delivered)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calculateRate(selectedCampaign.bounced, selectedCampaign.sent)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Event timeline */}
        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recipient Events</h2>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="space-y-4">
            {campaignEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={clsx('p-2 rounded-lg', getEventColor(event.type))}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 capitalize">{event.type}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{event.recipient}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(event.timestamp), 'MMM dd, yyyy at h:mm a')}
                  </p>
                  {event.metadata?.url && (
                    <p className="text-sm text-blue-600">Clicked: {event.metadata.url}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-gray-600">Analyze your email campaign performance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Export All
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="sending">Sending</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>

        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4" />
          More Filters
        </button>
      </div>

      {/* Campaigns table */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Campaign Performance</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Click Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr 
                  key={campaign.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {campaign.subject}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.recipients.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateRate(campaign.delivered, campaign.sent)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateRate(campaign.opened, campaign.delivered)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateRate(campaign.clicked, campaign.delivered)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      {
                        'bg-green-100 text-green-800': campaign.status === 'completed',
                        'bg-blue-100 text-blue-800': campaign.status === 'sending',
                        'bg-orange-100 text-orange-800': campaign.status === 'scheduled',
                        'bg-gray-100 text-gray-800': campaign.status === 'draft'
                      }
                    )}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(campaign.sentAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaign(campaign);
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <BarChart3 className="h-4 w-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}