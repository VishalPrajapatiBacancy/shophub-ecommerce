import { useState, useEffect, useCallback } from 'react';
import { Plus, Mail, MoreHorizontal, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { DropdownMenu, DropdownItem } from '@/components/ui/DropdownMenu';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { adminApi } from '@/api/admin';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import type { Customer } from '@/types';

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const emptyForm: CustomerForm = { name: '', email: '', phone: '', password: '' };

export function CustomersListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getCustomers({ page, limit, search: debouncedSearch || undefined })
      .then((res) => { setCustomers(res.data); setTotal(res.total); })
      .catch((err) => toast.error(err.message || 'Failed to load customers'))
      .finally(() => setLoading(false));
  }, [page, limit, debouncedSearch]);

  // Only fetch when modal is closed — prevents form typing from triggering searches
  useEffect(() => { if (!addModalOpen) fetchCustomers(); }, [fetchCustomers, addModalOpen]);

  const handleSearch = useCallback((value: string) => { setSearch(value); setPage(1); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setFormError(null);
    setSearch('');     // clear search so typing in form doesn't confuse the list
    setAddModalOpen(true);
  };

  const openView = async (customerId: string) => {
    setViewLoading(true);
    setViewCustomer(null);
    try {
      const res = await adminApi.getCustomer(customerId);
      setViewCustomer(res.data as Customer);
    } catch {
      // show partial data from table if detail call fails
    } finally {
      setViewLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (!form.email.trim()) { setFormError('Email is required'); return; }
    if (!form.password || form.password.length < 6) { setFormError('Password must be at least 6 characters'); return; }
    setSaving(true); setFormError(null);
    try {
      await adminApi.createCustomer({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone || undefined,
        password: form.password,
      });
      toast.success('Customer added');
      setAddModalOpen(false);
      setForm(emptyForm);
      fetchCustomers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally { setSaving(false); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      label: 'Customer',
      sortable: true,
      render: (customer) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
            {getInitials(customer.name)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{customer.name}</p>
            <p className="text-xs text-gray-500">{customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (customer) => <span className="text-gray-600">{customer.phone || '—'}</span>,
    },
    {
      key: 'totalOrders',
      label: 'Orders',
      sortable: true,
      render: (customer) => <span className="text-gray-700">{customer.totalOrders}</span>,
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (customer) => <span className="font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</span>,
    },
    {
      key: 'lastOrderDate',
      label: 'Last Order',
      render: (customer) => (
        <span className="text-gray-500">{customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (customer) => <StatusBadge status={customer.status} />,
    },
    {
      key: 'id' as keyof Customer,
      label: '',
      className: 'w-12',
      render: (customer) => (
        <DropdownMenu
          trigger={
            <button className="p-1 rounded hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          }
        >
          <DropdownItem onClick={() => openView(customer.id)}>
            <Eye className="h-4 w-4" /> View Details
          </DropdownItem>
          <DropdownItem onClick={() => window.open(`mailto:${customer.email}`)}>
            <Mail className="h-4 w-4" /> Send Email
          </DropdownItem>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">{loading ? 'Loading...' : `${total} customers found`}</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Customer
        </Button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      <Card padding={false}>
        <div className="p-4 border-b border-border">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Search by name or email..."
            className="sm:w-80"
          />
        </div>

        {loading && customers.length === 0 ? (
          <div className="p-8"><Skeleton className="h-64 w-full rounded-lg" /></div>
        ) : (
          <DataTable
            data={customers as unknown as Record<string, unknown>[]}
            columns={columns as Column<Record<string, unknown>>[]}
            keyExtractor={(item) => (item as unknown as Customer).id}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Add Customer Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Customer" size="md">
        {/* stopPropagation prevents keystrokes from reaching the search input behind the modal */}
        <div className="space-y-4" onKeyDown={e => e.stopPropagation()}>
          {formError && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{formError}</p>}
          <div>
            <Label htmlFor="cust-name">Full Name *</Label>
            <Input
              id="cust-name"
              name="cust-name"
              autoComplete="off"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cust-email">Email Address *</Label>
            <Input
              id="cust-email"
              name="cust-email"
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="john@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cust-phone">Phone Number</Label>
            <Input
              id="cust-phone"
              name="cust-phone"
              type="tel"
              autoComplete="off"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+1 (555) 000-0000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cust-pass">Password *</Label>
            <Input
              id="cust-pass"
              name="cust-pass"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Minimum 6 characters"
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Creating...' : 'Add Customer'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Customer Modal */}
      <Modal
        isOpen={viewLoading || viewCustomer !== null}
        onClose={() => { setViewCustomer(null); setViewLoading(false); }}
        title="Customer Details"
        size="md"
      >
        {viewLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-10 w-3/4 rounded-lg" />
            <Skeleton className="h-10 w-1/2 rounded-lg" />
          </div>
        ) : viewCustomer ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-lg font-semibold">
                {getInitials(viewCustomer.name)}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{viewCustomer.name}</p>
                <p className="text-sm text-gray-500">{viewCustomer.email}</p>
                {viewCustomer.phone && <p className="text-sm text-gray-500">{viewCustomer.phone}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{viewCustomer.totalOrders}</p>
                <p className="text-xs text-blue-600 mt-1">Total Orders</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-700">{formatCurrency(viewCustomer.totalSpent)}</p>
                <p className="text-xs text-green-600 mt-1">Total Spent</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <StatusBadge status={viewCustomer.status} />
                <p className="text-xs text-purple-600 mt-1">Status</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {viewCustomer.lastOrderDate && (
                <p>Last order: <span className="font-medium">{formatDate(viewCustomer.lastOrderDate)}</span></p>
              )}
              <p>Member since: <span className="font-medium">{formatDate(viewCustomer.createdAt)}</span></p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => window.open(`mailto:${viewCustomer.email}`)}>
                <Mail className="h-4 w-4 mr-1" /> Send Email
              </Button>
              <Button variant="outline" onClick={() => { setViewCustomer(null); setViewLoading(false); }}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
