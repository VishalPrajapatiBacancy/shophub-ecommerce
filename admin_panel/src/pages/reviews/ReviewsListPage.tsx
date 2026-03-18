import { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/api/admin';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import type { Review } from '@/types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

export function ReviewsListPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(() => {
    setLoading(true); setError(null);
    adminApi.getReviews({ page, limit: 20, status: statusFilter || undefined })
      .then(res => { setReviews(res.data); setTotal(res.total); setTotalPages(res.totalPages); })
      .catch(err => setError(err.message || 'Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      await adminApi.updateReviewStatus(id, action);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    setActionLoading(id);
    try {
      await adminApi.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      setTotal(t => t - 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (s: string) => {
    if (s === 'approved') return 'bg-green-100 text-green-800';
    if (s === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">Moderate and manage product reviews ({total})</p>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      <Card padding={false}>
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            {[{ value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }].map(opt => (
              <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === opt.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">{total} reviews</p>
        </div>

        {loading && reviews.length === 0 ? (
          <div className="p-8"><Skeleton className="h-48 w-full rounded-lg" /></div>
        ) : reviews.length === 0 ? (
          <EmptyState icon={Star} title="No reviews found" description="Reviews will appear here once customers submit them." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-border bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Review</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reviews.map((r) => {
                    const isLoading = actionLoading === r.id;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 max-w-[160px] truncate">{r.productName || '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{r.customer?.name ?? '—'}</td>
                        <td className="px-6 py-3"><StarRating rating={r.rating} /></td>
                        <td className="px-6 py-3 max-w-[220px]">
                          {r.title && <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>}
                          <p className="text-xs text-gray-500 truncate">{r.comment || '—'}</p>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(r.status)}`}>{r.status}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {r.status !== 'approved' && (
                              <button onClick={() => handleAction(r.id, 'approved')} disabled={isLoading} className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" title="Approve">
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            {r.status !== 'rejected' && (
                              <button onClick={() => handleAction(r.id, 'rejected')} disabled={isLoading} className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600" title="Reject">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(r.id)} disabled={isLoading} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-border">
                <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
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
