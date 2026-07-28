import { useState } from 'react';
import {
  Activity,
  Database,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Mail,
  Server
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface QueueJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: any;
  createdAt: string;
  processedAt?: string;
  error?: string;
}

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  metadata?: any;
}

const mockQueueJobs: QueueJob[] = [
  {
    id: '1',
    type: 'send_email',
    status: 'processing',
    data: { campaignId: 'summer-sale', recipients: 250 },
    createdAt: '2024-01-15T10:30:00Z',
    processedAt: '2024-01-15T10:30:15Z'
  },
  {
    id: '2',
    type: 'send_email',
    status: 'pending',
    data: { campaignId: 'product-update', recipients: 180 },
    createdAt: '2024-01-15T10:25:00Z'
  },
  {
    id: '3',
    type: 'send_email',
    status: 'failed',
    data: { campaignId: 'welcome-series', recipients: 50 },
    createdAt: '2024-01-15T10:20:00Z',
    processedAt: '2024-01-15T10:20:30Z',
    error: 'API rate limit exceeded'
  },
  {
    id: '4',
    type: 'send_email',
    status: 'completed',
    data: { campaignId: 'newsletter', recipients: 500 },
    createdAt: '2024-01-15T10:15:00Z',
    processedAt: '2024-01-15T10:18:45Z'
  }
];

const mockSystemLogs: SystemLog[] = [
  {
    id: '1',
    level: 'info',
    message: 'Email campaign "Summer Sale" started processing',
    timestamp: '2024-01-15T10:30:00Z',
    metadata: { campaignId: 'summer-sale' }
  },
  {
    id: '2',
    level: 'warning',
    message: 'High bounce rate detected for campaign "Product Update"',
    timestamp: '2024-01-15T10:28:00Z',
    metadata: { bounceRate: 5.2 }
  },
  {
    id: '3',
    level: 'error',
    message: 'Failed to send email batch due to API rate limit',
    timestamp: '2024-01-15T10:25:00Z',
    metadata: { batchSize: 50 }
  },
  {
    id: '4',
    level: 'info',
    message: 'Database cleanup completed',
    timestamp: '2024-01-15T10:00:00Z'
  }
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'queue' | 'logs' | 'system'>('queue');
  const [queueJobs] = useState<QueueJob[]>(mockQueueJobs);
  const [systemLogs] = useState<SystemLog[]>(mockSystemLogs);
  const [queuePaused, setQueuePaused] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Activity className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-2 text-gray-600">System administration and monitoring</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Queue Status</p>
              <p className="text-2xl font-bold text-gray-900">
                {queuePaused ? 'Paused' : 'Active'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Jobs Processed Today</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Server className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">System Load</p>
              <p className="text-2xl font-bold text-gray-900">42%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'queue', name: 'Send Queue', icon: Activity },
            { id: 'logs', name: 'System Logs', icon: Database },
            { id: 'system', name: 'System Health', icon: Server }
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

      {/* Queue Tab */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Queue controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQueuePaused(!queuePaused)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                queuePaused
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              )}
            >
              {queuePaused ? (
                <>
                  <Play className="h-4 w-4" />
                  Resume Queue
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pause Queue
                </>
              )}
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <RotateCcw className="h-4 w-4" />
              Retry Failed
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 className="h-4 w-4" />
              Clear Completed
            </button>
          </div>

          {/* Queue table */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Queue Jobs</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Error
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queueJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {job.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className={clsx(
                            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                            getStatusColor(job.status)
                          )}>
                            {job.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.data.recipients?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(job.createdAt), 'MMM dd, HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {job.error || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {job.status === 'failed' && (
                            <button className="text-blue-600 hover:text-blue-900">
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Logs</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {systemLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <span className={clsx(
                      'inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 mt-0.5',
                      getLevelColor(log.level)
                    )}>
                      {log.level.toUpperCase()}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{log.message}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </span>
                        {log.metadata && (
                          <span className="text-xs text-gray-500 font-mono">
                            {JSON.stringify(log.metadata)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CPU Usage</span>
                    <span className="text-gray-900">42%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Memory Usage</span>
                    <span className="text-gray-900">68%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Disk Usage</span>
                    <span className="text-gray-900">23%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
              <div className="space-y-3">
                {[
                  { name: 'Web Server', status: 'healthy' },
                  { name: 'Database', status: 'healthy' },
                  { name: 'Queue Worker', status: 'healthy' },
                  { name: 'Email Service', status: 'warning' },
                  { name: 'Cache Server', status: 'healthy' }
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{service.name}</span>
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        'w-2 h-2 rounded-full',
                        {
                          'bg-green-500': service.status === 'healthy',
                          'bg-yellow-500': service.status === 'warning',
                          'bg-red-500': service.status === 'error'
                        }
                      )} />
                      <span className={clsx(
                        'text-xs font-medium',
                        {
                          'text-green-600': service.status === 'healthy',
                          'text-yellow-600': service.status === 'warning',
                          'text-red-600': service.status === 'error'
                        }
                      )}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-sm font-medium text-gray-900 mb-1">Clear Cache</div>
                <div className="text-xs text-gray-600">Clear application cache</div>
              </button>
              
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="text-sm font-medium text-gray-900 mb-1">Backup Database</div>
                <div className="text-xs text-gray-600">Create database backup</div>
              </button>
              
              <button className="p-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left">
                <div className="text-sm font-medium mb-1">Restart Services</div>
                <div className="text-xs">Restart all system services</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}