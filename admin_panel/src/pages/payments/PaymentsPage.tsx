import { useState, useEffect, useCallback } from 'react';
import { CreditCard, DollarSign, RefreshCw, TrendingDown, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { adminApi } from '@/api/admin';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PaymentItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

interface PaymentStats {
  totalRevenue: number;
  totalRefunded: number;
  pending: number;
  failed: number;
  methodBreakdown: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

const METHOD_ICONS: Record<string, string> = {
  card: '💳',
  cod: '💵',
  wallet: '👛',
  bank: '🏦',
  upi: '📱',
};

export function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = useCallback(() => {
    setLoading(true); setError(null);
    adminApi.getPayments({ page, limit: 20, status: statusFilter || undefined, search: search || undefined })
      .then(res => {
        setPayments(res.data as PaymentItem[]);
        setStats(res.stats as PaymentStats);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(err => setError((err as Error).message || 'Failed to load payments'))
      .finally(() => setLoading(false));
  }, [page, statusFilter, search]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">View transaction history and payment analytics</p>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Refunded', value: formatCurrency(stats.totalRefunded), icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Failed', value: stats.failed, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Method Breakdown */}
      {stats?.methodBreakdown && Object.keys(stats.methodBreakdown).length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Methods</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.methodBreakdown).map(([method, count]) => (
              <div key={method} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <span>{METHOD_ICONS[method] || '💰'}</span>
                <span className="text-sm font-medium text-gray-700 capitalize">{method}</span>
                <span className="text-sm text-gray-500">({count})</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Table */}
      <Card padding={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by order or customer..." className="sm:w-72" />
          <div className="flex gap-2">
            {[{ value: '', label: 'All' }, { value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }].map(opt => (
              <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === opt.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8"><Skeleton className="h-64 w-full" /></div>
        ) : payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No transactions found" description="Payment transactions will appear here." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-border bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 text-sm font-medium text-primary-600">{p.orderNumber}</td>
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-gray-900">{p.customerName}</p>
                        <p className="text-xs text-gray-400">{p.customerEmail}</p>
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-900">{formatCurrency(p.amount)}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 capitalize">
                        {METHOD_ICONS[p.method] || '💰'} {p.method}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-800'}`}>{p.status}</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-border">
                <p className="text-sm text-gray-500">Page {page} of {totalPages} · {total} transactions</p>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50">Prev</button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
