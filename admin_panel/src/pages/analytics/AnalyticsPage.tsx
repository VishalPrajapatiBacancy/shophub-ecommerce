import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Users, Package } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/api/admin';
import { formatCurrency } from '@/lib/utils';

type Period = '7d' | '30d' | '90d' | '12m';

interface AnalyticsData {
  period: string;
  stats: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalCustomers: number;
    newCustomers: number;
    totalProducts: number;
  };
  chartData: Array<{ name: string; revenue: number; orders: number }>;
  statusBreakdown: Record<string, number>;
  paymentBreakdown: Record<string, number>;
}

const PERIOD_LABELS: Record<Period, string> = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', '12m': 'Last 12 Months' };
const PIE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);
    adminApi.getAnalytics({ period })
      .then(res => setData(res.data as AnalyticsData))
      .catch(err => setError((err as Error).message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-96" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i=><Skeleton key={i} className="h-24 rounded-lg" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[1,2].map(i=><Skeleton key={i} className="h-72 rounded-lg" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Business insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>}

      {data && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Revenue', value: formatCurrency(data.stats.totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Orders', value: data.stats.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Avg Order Value', value: formatCurrency(data.stats.avgOrderValue), icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'New Customers', value: data.stats.newCustomers.toLocaleString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}><Icon className={`h-6 w-6 ${color}`} /></div>
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tick={{ fill: '#9CA3AF' }} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders Chart */}
            <Card>
              <CardHeader><CardTitle>Orders Volume</CardTitle></CardHeader>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} />
                    <Tooltip formatter={(v: number) => [v, 'Orders']} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                    <Bar dataKey="orders" fill="#2563EB" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Order Status Pie */}
            {Object.keys(data.statusBreakdown).length > 0 && (
              <Card>
                <CardHeader><CardTitle>Order Status Distribution</CardTitle></CardHeader>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={Object.entries(data.statusBreakdown).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {Object.keys(data.statusBreakdown).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={10} formatter={(v) => <span className="text-xs text-gray-600 capitalize">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Payment Method Breakdown */}
            {Object.keys(data.paymentBreakdown).length > 0 && (
              <Card>
                <CardHeader><CardTitle>Revenue by Payment Method</CardTitle></CardHeader>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={Object.entries(data.paymentBreakdown).map(([name, value]) => ({ name: name.toUpperCase(), value: Math.round(value) }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {Object.keys(data.paymentBreakdown).map((_, i) => <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                      <Legend iconSize={10} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
