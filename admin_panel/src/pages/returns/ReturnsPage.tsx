import { useState, useEffect, useCallback } from 'react';
import { Undo2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/api/admin';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ReturnItem {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  reason: string;
  refundAmount: number;
  refundStatus: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
};

const REFUND_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReturns = useCallback(() => {
    setLoading(true); setError(null);
    adminApi.getReturns({ page: 1, limit: 50, status: statusFilter || undefined })
      .then(res => {
        setReturns(res.data as ReturnItem[]);
        setTotal(res.total);
      })
      .catch(err => setError((err as Error).message || 'Failed to load returns'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await adminApi.updateReturn(id, { status });
      setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      setError((err as Error).message || 'Update failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Returns</h1>
        <p className="text-sm text-gray-500 mt-1">Process return requests and manage refunds ({total})</p>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      <Card padding={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            {[{ value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'completed', label: 'Completed' }, { value: 'rejected', label: 'Rejected' }].map(opt => (
              <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === opt.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={fetchReturns} className="p-1.5 rounded hover:bg-gray-100 text-gray-400">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-8"><Skeleton className="h-64 w-full rounded-lg" /></div>
        ) : returns.length === 0 ? (
          <EmptyState icon={Undo2} title="No returns found" description="Return requests from customers will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-border bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Refund</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Refund Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {returns.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-sm font-medium text-primary-600">{r.orderNumber}</td>
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-gray-900">{r.customerName}</p>
                      <p className="text-xs text-gray-400">{r.customerEmail}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 max-w-[160px] truncate">{r.reason || '—'}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{formatCurrency(r.refundAmount)}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-800'}`}>{r.status}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${REFUND_COLORS[r.refundStatus] || 'bg-gray-100 text-gray-800'}`}>{r.refundStatus}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusUpdate(r.id, 'approved')} disabled={actionLoading === r.id} className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">Approve</button>
                            <button onClick={() => handleStatusUpdate(r.id, 'rejected')} disabled={actionLoading === r.id} className="px-2 py-1 rounded text-xs bg-red-50 text-red-700 hover:bg-red-100">Reject</button>
                          </>
                        )}
                        {r.status === 'approved' && (
                          <button onClick={() => handleStatusUpdate(r.id, 'completed')} disabled={actionLoading === r.id} className="px-2 py-1 rounded text-xs bg-green-50 text-green-700 hover:bg-green-100">Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
