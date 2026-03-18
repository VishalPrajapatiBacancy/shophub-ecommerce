import { useState, useEffect, useCallback } from 'react';
import { HeadphonesIcon, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { adminApi } from '@/api/admin';
import { formatDate } from '@/lib/utils';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', customerName: '', customerEmail: '', category: 'general', priority: 'medium', message: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTickets = useCallback(() => {
    setLoading(true); setError(null);
    adminApi.getTickets({ limit: 50, status: statusFilter || undefined, priority: priorityFilter || undefined, search: search || undefined })
      .then(res => { setTickets(res.data as Ticket[]); setTotal(res.total); })
      .catch(err => setError((err as Error).message || 'Failed to load tickets'))
      .finally(() => setLoading(false));
  }, [statusFilter, priorityFilter, search]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await adminApi.updateTicket(id, { status });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (err) { setError((err as Error).message); }
    finally { setActionLoading(null); }
  };

  const handleCreate = async () => {
    if (!form.subject.trim()) { setFormError('Subject is required'); return; }
    setSaving(true); setFormError(null);
    try {
      await adminApi.createTicket(form);
      setModalOpen(false);
      setForm({ subject: '', customerName: '', customerEmail: '', category: 'general', priority: 'medium', message: '' });
      fetchTickets();
    } catch (err) { setFormError((err as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-sm text-gray-500 mt-1">Customer support tickets and help desk ({total})</p>
        </div>
        <Button onClick={() => { setFormError(null); setModalOpen(true); }}><Plus className="h-4 w-4 mr-1" /> New Ticket</Button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      <Card padding={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Search tickets..." className="sm:w-64" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8"><Skeleton className="h-64 w-full" /></div>
        ) : tickets.length === 0 ? (
          <EmptyState icon={HeadphonesIcon} title="No support tickets" description="Customer support tickets will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-border bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-primary-600">{t.ticketNumber}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[180px]">{t.subject}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">{t.customerName}</p>
                      <p className="text-xs text-gray-400">{t.customerEmail}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 capitalize">{t.category}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_COLORS[t.priority] || 'bg-gray-100 text-gray-800'}`}>{t.priority}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-800'}`}>{t.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(t.createdAt)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {t.status === 'open' && <button onClick={() => handleStatusChange(t.id, 'in_progress')} disabled={actionLoading === t.id} className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 whitespace-nowrap">In Progress</button>}
                        {t.status === 'in_progress' && <button onClick={() => handleStatusChange(t.id, 'resolved')} disabled={actionLoading === t.id} className="px-2 py-1 rounded text-xs bg-green-50 text-green-700 hover:bg-green-100">Resolve</button>}
                        {(t.status === 'resolved' || t.status === 'in_progress') && <button onClick={() => handleStatusChange(t.id, 'closed')} disabled={actionLoading === t.id} className="px-2 py-1 rounded text-xs bg-gray-50 text-gray-700 hover:bg-gray-100">Close</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Ticket Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Support Ticket" size="md">
        <div className="space-y-4">
          {formError && <p className="text-red-600 bg-red-50 p-3 rounded text-sm">{formError}</p>}
          <div>
            <Label htmlFor="t-subj">Subject *</Label>
            <Input id="t-subj" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Ticket subject" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="t-cname">Customer Name</Label>
              <Input id="t-cname" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Customer name" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="t-cemail">Customer Email</Label>
              <Input id="t-cemail" type="email" value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} placeholder="customer@email.com" className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="t-cat">Category</Label>
              <select id="t-cat" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="general">General</option>
                <option value="order">Order Issue</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
                <option value="shipping">Shipping</option>
                <option value="product">Product</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            <div>
              <Label htmlFor="t-pri">Priority</Label>
              <select id="t-pri" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="t-msg">Message</Label>
            <textarea id="t-msg" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Describe the issue..." />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create Ticket'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
