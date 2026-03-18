import { useState, useEffect } from 'react';
import { Bell, Send, Users, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/api/admin';
import { formatDate } from '@/lib/utils';

interface NotifHistory {
  id: string;
  title: string;
  message: string;
  type: string;
  targetType: string;
  status: string;
  sentAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  general: 'bg-blue-100 text-blue-800',
  order: 'bg-purple-100 text-purple-800',
  promotion: 'bg-green-100 text-green-800',
  alert: 'bg-red-100 text-red-800',
};

export function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general');
  const [targetType, setTargetType] = useState('all');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const [history, setHistory] = useState<NotifHistory[]>([]);
  const [histLoading, setHistLoading] = useState(true);

  const fetchHistory = () => {
    setHistLoading(true);
    adminApi.getNotifications({ limit: 50 })
      .then(res => setHistory(res.data as NotifHistory[]))
      .catch(() => {})
      .finally(() => setHistLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { setSendError('Title and message are required'); return; }
    setSending(true); setSendError(null); setSendSuccess(false);
    try {
      await adminApi.sendNotification({ title, message, type, targetType });
      setSendSuccess(true);
      setTitle(''); setMessage('');
      fetchHistory();
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err) {
      setSendError((err as Error).message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">Send notifications and view history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Send className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Send Notification</h2>
          </div>

          <div className="space-y-4">
            {sendError && <p className="text-red-600 bg-red-50 p-3 rounded text-sm">{sendError}</p>}
            {sendSuccess && <p className="text-green-700 bg-green-50 p-3 rounded text-sm">Notification sent successfully!</p>}
            <div>
              <Label htmlFor="n-title">Title *</Label>
              <Input id="n-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. New Sale Event!" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="n-message">Message *</Label>
              <textarea id="n-message" value={message} onChange={e => setMessage(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Enter your notification message..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="n-type">Type</Label>
                <select id="n-type" value={type} onChange={e => setType(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="general">General</option>
                  <option value="order">Order Update</option>
                  <option value="promotion">Promotion</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
              <div>
                <Label htmlFor="n-target">Target</Label>
                <select id="n-target" value={targetType} onChange={e => setTargetType(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="all">All Users</option>
                  <option value="customers">Customers Only</option>
                  <option value="staff">Staff Only</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              {targetType === 'all' ? <Globe className="h-4 w-4 text-gray-400" /> : <Users className="h-4 w-4 text-gray-400" />}
              Sending to: <span className="font-medium capitalize">{targetType === 'all' ? 'All users' : targetType}</span>
            </div>
            <Button onClick={handleSend} disabled={sending} className="w-full">
              <Send className="h-4 w-4 mr-2" />{sending ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
        </Card>

        {/* Quick Templates */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
              <Bell className="h-4 w-4 text-purple-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Quick Templates</h2>
          </div>
          <div className="space-y-2">
            {[
              { title: 'Order Shipped', message: 'Your order has been shipped and is on its way!', type: 'order' },
              { title: 'Flash Sale Live!', message: 'Up to 50% off on selected items. Shop now before it ends!', type: 'promotion' },
              { title: 'Order Delivered', message: 'Your order has been delivered. Enjoy your purchase!', type: 'order' },
              { title: 'New Arrivals', message: 'Check out our latest collection of products now!', type: 'general' },
              { title: 'Low Stock Alert', message: 'Hurry! Limited stock remaining on popular items.', type: 'alert' },
            ].map(t => (
              <button key={t.title} onClick={() => { setTitle(t.title); setMessage(t.message); setType(t.type); }}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <p className="text-sm font-medium text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{t.message}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* History */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-gray-900">Sent Notifications</h2>
        </div>
        {histLoading ? (
          <div className="p-6"><Skeleton className="h-40 w-full" /></div>
        ) : history.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500">No notifications sent yet</div>
        ) : (
          <div className="divide-y divide-border">
            {history.map(n => (
              <div key={n.id} className="px-6 py-4 hover:bg-gray-50/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-800'}`}>{n.type}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{n.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">{formatDate(n.sentAt)}</p>
                    <p className="text-xs text-gray-400 capitalize">{n.targetType}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
