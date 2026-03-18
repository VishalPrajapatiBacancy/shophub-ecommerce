import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminApi } from '@/api/admin';

// Mock the api-client module
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn(),
  },
}));

// Import the mock so we can assert on it
import { apiClient } from '@/lib/api-client';

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockPatch = vi.mocked(apiClient.patch);
const mockDelete = vi.mocked(apiClient.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Banners ──────────────────────────────────────────────────────────────────

describe('adminApi.getBanners', () => {
  it('calls GET /admin/banners with no params when called without arguments', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 1 });
    adminApi.getBanners();
    expect(mockGet).toHaveBeenCalledWith('/admin/banners', { params: {} });
  });

  it('calls GET /admin/banners with correct search param', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 1 });
    adminApi.getBanners({ search: 'summer', page: 1, limit: 10 });
    expect(mockGet).toHaveBeenCalledWith('/admin/banners', {
      params: { search: 'summer', page: '1', limit: '10' },
    });
  });

  it('calls GET /admin/banners with status param', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 1 });
    adminApi.getBanners({ status: 'active' });
    expect(mockGet).toHaveBeenCalledWith('/admin/banners', {
      params: { status: 'active' },
    });
  });
});

describe('adminApi.createBanner', () => {
  it('calls POST /admin/banners with the provided body', async () => {
    const body = { title: 'Summer Sale', imageUrl: 'https://example.com/img.jpg', isActive: true };
    mockPost.mockResolvedValueOnce({ success: true, data: { id: '1', ...body } });
    await adminApi.createBanner(body);
    expect(mockPost).toHaveBeenCalledWith('/admin/banners', body);
  });
});

describe('adminApi.updateBanner', () => {
  it('calls PUT /admin/banners/:id with the provided body', async () => {
    const body = { title: 'Updated Banner' };
    mockPut.mockResolvedValueOnce({ success: true, data: { id: 'abc', ...body } });
    await adminApi.updateBanner('abc', body);
    expect(mockPut).toHaveBeenCalledWith('/admin/banners/abc', body);
  });
});

describe('adminApi.deleteBanner', () => {
  it('calls DELETE /admin/banners/:id', async () => {
    mockDelete.mockResolvedValueOnce({ success: true });
    await adminApi.deleteBanner('xyz');
    expect(mockDelete).toHaveBeenCalledWith('/admin/banners/xyz');
  });
});

// ─── Reviews ──────────────────────────────────────────────────────────────────

describe('adminApi.getReviews', () => {
  it('calls GET /admin/reviews with status filter param', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 1 });
    adminApi.getReviews({ status: 'pending' });
    expect(mockGet).toHaveBeenCalledWith('/admin/reviews', {
      params: { status: 'pending' },
    });
  });

  it('calls GET /admin/reviews with page and limit params', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], total: 0, page: 2, limit: 20, totalPages: 5 });
    adminApi.getReviews({ page: 2, limit: 20 });
    expect(mockGet).toHaveBeenCalledWith('/admin/reviews', {
      params: { page: '2', limit: '20' },
    });
  });

  it('omits undefined/empty params', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 1 });
    adminApi.getReviews({});
    expect(mockGet).toHaveBeenCalledWith('/admin/reviews', { params: {} });
  });
});

describe('adminApi.updateReviewStatus', () => {
  it('calls PATCH /admin/reviews/:id with status body', async () => {
    mockPatch.mockResolvedValueOnce({ success: true });
    await adminApi.updateReviewStatus('rev-1', 'approved');
    expect(mockPatch).toHaveBeenCalledWith('/admin/reviews/rev-1', { status: 'approved' });
  });

  it('calls PATCH /admin/reviews/:id with rejected status', async () => {
    mockPatch.mockResolvedValueOnce({ success: true });
    await adminApi.updateReviewStatus('rev-2', 'rejected');
    expect(mockPatch).toHaveBeenCalledWith('/admin/reviews/rev-2', { status: 'rejected' });
  });
});

// ─── Returns ──────────────────────────────────────────────────────────────────

describe('adminApi.getReturns', () => {
  it('calls GET /admin/returns with page/limit params', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], total: 0, page: 1, limit: 50, totalPages: 1 });
    adminApi.getReturns({ page: 1, limit: 50 });
    expect(mockGet).toHaveBeenCalledWith('/admin/returns', {
      params: { page: '1', limit: '50' },
    });
  });

  it('calls GET /admin/returns with status param', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], total: 0, page: 1, limit: 50, totalPages: 1 });
    adminApi.getReturns({ status: 'pending' });
    expect(mockGet).toHaveBeenCalledWith('/admin/returns', {
      params: { status: 'pending' },
    });
  });
});

// ─── Payments ─────────────────────────────────────────────────────────────────

describe('adminApi.getPayments', () => {
  it('calls GET /admin/payments with status and search params', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], stats: {}, total: 0, page: 1, limit: 20, totalPages: 1 });
    adminApi.getPayments({ status: 'paid', search: 'ORD-001' });
    expect(mockGet).toHaveBeenCalledWith('/admin/payments', {
      params: { status: 'paid', search: 'ORD-001' },
    });
  });

  it('calls GET /admin/payments with page param', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], stats: {}, total: 0, page: 2, limit: 20, totalPages: 3 });
    adminApi.getPayments({ page: 2, limit: 20 });
    expect(mockGet).toHaveBeenCalledWith('/admin/payments', {
      params: { page: '2', limit: '20' },
    });
  });
});

// ─── Roles ────────────────────────────────────────────────────────────────────

describe('adminApi.getRoles', () => {
  it('calls GET /admin/roles without params', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [] });
    adminApi.getRoles();
    expect(mockGet).toHaveBeenCalledWith('/admin/roles');
  });
});

describe('adminApi.createRole', () => {
  it('calls POST /admin/roles with name and permissions body', async () => {
    const body = { name: 'Editor', description: 'Can edit products', permissions: { products: ['view', 'edit'] } };
    mockPost.mockResolvedValueOnce({ success: true, data: { id: 'r1', ...body } });
    await adminApi.createRole(body);
    expect(mockPost).toHaveBeenCalledWith('/admin/roles', body);
  });
});

describe('adminApi.updateRole', () => {
  it('calls PUT /admin/roles/:id with updated fields', async () => {
    const body = { name: 'Senior Editor', permissions: { products: ['view', 'edit', 'create'] } };
    mockPut.mockResolvedValueOnce({ success: true, data: { id: 'r1', ...body } });
    await adminApi.updateRole('r1', body);
    expect(mockPut).toHaveBeenCalledWith('/admin/roles/r1', body);
  });
});

describe('adminApi.deleteRole', () => {
  it('calls DELETE /admin/roles/:id', async () => {
    mockDelete.mockResolvedValueOnce({ success: true });
    await adminApi.deleteRole('r1');
    expect(mockDelete).toHaveBeenCalledWith('/admin/roles/r1');
  });
});

// ─── Settings ─────────────────────────────────────────────────────────────────

describe('adminApi.getSettings', () => {
  it('calls GET /admin/settings', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: {} });
    adminApi.getSettings();
    expect(mockGet).toHaveBeenCalledWith('/admin/settings');
  });
});

describe('adminApi.updateSettings', () => {
  it('calls PUT /admin/settings with settings body', async () => {
    const body = { storeName: 'ShopHub', currency: 'USD', taxRate: 8 };
    mockPut.mockResolvedValueOnce({ success: true, data: body });
    await adminApi.updateSettings(body);
    expect(mockPut).toHaveBeenCalledWith('/admin/settings', body);
  });
});

// ─── buildParams edge cases ────────────────────────────────────────────────────

describe('buildParams (via getProducts)', () => {
  it('only includes defined params — skips null/undefined fields', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 1 });
    adminApi.getProducts({ page: 1 });
    expect(mockGet).toHaveBeenCalledWith('/admin/products', { params: { page: '1' } });
  });

  it('includes all provided params correctly', () => {
    mockGet.mockResolvedValueOnce({ success: true, data: [], total: 0, page: 1, limit: 25, totalPages: 2 });
    adminApi.getProducts({ page: 1, limit: 25, search: 'shirt', status: 'active', sort: 'name', order: 'asc' });
    expect(mockGet).toHaveBeenCalledWith('/admin/products', {
      params: { page: '1', limit: '25', search: 'shirt', status: 'active', sort: 'name', order: 'asc' },
    });
  });
});
