import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, MoreHorizontal, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs } from '@/components/ui/Tabs';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { adminApi } from '@/api/admin';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order } from '@/types';

const statusTabs = [
  { label: 'All',              value: 'all' },
  { label: 'Placed',           value: 'placed' },
  { label: 'Confirmed',        value: 'confirmed' },
  { label: 'Packed',           value: 'packed' },
  { label: 'Processing',       value: 'processing' },
  { label: 'Shipped',          value: 'shipped' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered',        value: 'delivered' },
  { label: 'Cancelled',        value: 'cancelled' },
  { label: 'Returned',         value: 'returned' },
  { label: 'Refunded',         value: 'refunded' },
];

const ORDER_STATUSES = [
  'placed', 'confirmed', 'packed', 'processing',
  'shipped', 'out_for_delivery', 'delivered',
  'cancelled', 'returned', 'refunded',
];

export function OrdersListPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View order state
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Create order modal
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getOrders({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: activeTab === 'all' ? undefined : activeTab,
      })
      .then((res) => { setOrders(res.data); setTotal(res.total); })
      .catch((err) => toast.error(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [page, limit, debouncedSearch, activeTab]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSearch = useCallback((value: string) => { setSearch(value); setPage(1); }, []);

  const openView = async (orderId: string) => {
    setViewLoading(true);
    setViewOrder(null);
    setNewStatus('');
    setTrackingNumber('');
    try {
      const res = await adminApi.getOrder(orderId);
      const order = res.data as Order;
      setViewOrder(order);
      setNewStatus(order.status);
      setTrackingNumber(order.trackingNumber || '');
    } catch {
      setError('Failed to load order details');
    } finally {
      setViewLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!viewOrder) return;
    setUpdatingStatus(true);
    try {
      await adminApi.updateOrderStatus(viewOrder.id, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
      });
      setViewOrder(prev => prev ? { ...prev, status: newStatus as Order['status'], trackingNumber } : null);
      fetchOrders();
      toast.success('Order updated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const tabsWithCounts = statusTabs.map((tab) => ({ ...tab, count: tab.value === 'all' ? total : undefined }));

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      label: 'Order',
      sortable: true,
      render: (order) => (
        <span className="font-medium text-primary-600">{order.orderNumber}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (order) => (
        <div>
          <p className="font-medium text-gray-900">{order.customer?.name ?? '—'}</p>
          <p className="text-xs text-gray-500">{order.customer?.email ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (order) => (
        <span className="text-gray-700">
          {(order.items?.length ?? 0)} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (order) => <span className="font-medium text-gray-900">{formatCurrency(order.total)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (order) => <StatusBadge status={order.status} />,
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (order) => <StatusBadge status={order.paymentStatus} />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (order) => <span className="text-gray-500">{formatDate(order.createdAt)}</span>,
    },
    {
      key: 'id' as keyof Order,
      label: '',
      className: 'w-12',
      render: (order) => (
        <DropdownMenu
          trigger={
            <button className="p-1 rounded hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          }
        >
          <DropdownItem onClick={() => openView(order.id)}>
            <Eye className="h-4 w-4" /> View Details
          </DropdownItem>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{loading ? 'Loading...' : `${total} orders found`}</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Order
        </Button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      <Card padding={false}>
        <div className="px-4 pt-4">
          <Tabs tabs={tabsWithCounts} activeTab={activeTab} onChange={(v) => { setActiveTab(v); setPage(1); }} />
        </div>

        <div className="p-4 border-b border-border">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Search by order number or customer..."
            className="sm:w-96"
          />
        </div>

        {loading && orders.length === 0 ? (
          <div className="p-8"><Skeleton className="h-64 w-full rounded-lg" /></div>
        ) : (
          <DataTable
            data={orders as unknown as Record<string, unknown>[]}
            columns={columns as Column<Record<string, unknown>>[]}
            keyExtractor={(item) => (item as unknown as Order).id}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* View Order Details Modal */}
      <Modal
        isOpen={viewLoading || viewOrder !== null}
        onClose={() => { setViewOrder(null); setViewLoading(false); }}
        title="Order Details"
        size="lg"
      >
        {viewLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : viewOrder ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-lg font-bold text-primary-600">{viewOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{formatDate(viewOrder.createdAt)}</p>
              </div>
              <div>
                <StatusBadge status={viewOrder.status} />
              </div>
              <div>
                <StatusBadge status={viewOrder.paymentStatus} />
              </div>
            </div>

            {/* Customer */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Customer</p>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-900">{viewOrder.customer?.name}</p>
                <p>{viewOrder.customer?.email}</p>
              </div>
            </div>

            {/* Items */}
            {viewOrder.items && viewOrder.items.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Order Items</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {viewOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
                      {item.thumbnail
                        ? <img src={item.thumbnail} alt={item.name} className="h-10 w-10 rounded object-cover" />
                        : <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center"><Package className="h-4 w-4 text-gray-400" /></div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                      <p className="font-medium text-gray-900">{formatCurrency(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatCurrency(viewOrder.subtotal)}</span>
              </div>
              {viewOrder.tax > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span><span>{formatCurrency(viewOrder.tax)}</span>
                </div>
              )}
              {viewOrder.shipping > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span><span>{formatCurrency(viewOrder.shipping)}</span>
                </div>
              )}
              {viewOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-{formatCurrency(viewOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 text-base border-t border-gray-100 pt-2">
                <span>Total</span><span>{formatCurrency(viewOrder.total)}</span>
              </div>
            </div>

            {/* Update Status */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Update Order</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="o-status">Status</Label>
                  <select
                    id="o-status"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="o-tracking">Tracking Number</Label>
                  <Input
                    id="o-tracking"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-3">
                <Button variant="outline" onClick={() => { setViewOrder(null); setViewLoading(false); }}>
                  Close
                </Button>
                <Button onClick={handleUpdateStatus} disabled={updatingStatus}>
                  {updatingStatus ? 'Updating...' : 'Update Order'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Create Order Info Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Order" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Package className="h-8 w-8 text-blue-500 shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Manual Order Creation</p>
              <p className="text-sm text-blue-700 mt-1">
                Orders are typically placed by customers through the storefront. For manual orders, please use the API or have the customer place the order directly.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
