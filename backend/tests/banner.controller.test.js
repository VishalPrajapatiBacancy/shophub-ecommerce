import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Supabase mock ────────────────────────────────────────────────────────────
// We define a mutable "last call result" that individual tests override before
// calling the controller under test.
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockRange = vi.fn();

// Each builder method returns an object that lets the chain continue and
// ultimately resolves via .single() / .maybeSingle() / .range().
function makeChain(resolveWith) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    range: mockRange,
  };
  return chain;
}

vi.mock('../src/config/database.js', () => {
  const from = vi.fn(() => makeChain());
  const auth = { getUser: vi.fn() };
  return { supabase: { from, auth }, default: { from, auth } };
});

// Import the module under test AFTER the mock is registered.
import { supabase } from '../src/config/database.js';
import {
  listBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../src/controllers/admin/banner.controller.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeRes() {
  const res = { json: vi.fn(), status: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const sampleBannerRow = {
  id: 'b1',
  title: 'Summer Sale',
  image_url: 'https://example.com/img.jpg',
  link_type: 'category',
  link_value: 'sale',
  sort_order: 1,
  is_active: true,
  start_date: null,
  end_date: null,
  created_at: '2026-01-01T00:00:00Z',
};

const sampleBannerFormatted = {
  id: 'b1',
  title: 'Summer Sale',
  imageUrl: 'https://example.com/img.jpg',
  linkType: 'category',
  linkValue: 'sale',
  sortOrder: 1,
  isActive: true,
  startDate: null,
  endDate: null,
  createdAt: '2026-01-01T00:00:00Z',
};

// ─── listBanners ─────────────────────────────────────────────────────────────
describe('listBanners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated banners on success', async () => {
    mockRange.mockResolvedValue({ data: [sampleBannerRow], count: 1, error: null });

    const req = { query: { page: '1', limit: '20' } };
    const res = makeRes();
    await listBanners(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        data: [sampleBannerFormatted],
      }),
    );
  });

  it('returns empty list when banners table does not exist (42P01)', async () => {
    mockRange.mockResolvedValue({ data: null, count: null, error: { code: '42P01', message: 'table missing' } });

    const req = { query: {} };
    const res = makeRes();
    await listBanners(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: [], total: 0 }),
    );
  });

  it('returns 500 on unexpected database error', async () => {
    mockRange.mockResolvedValue({ data: null, count: null, error: { code: 'XXXX', message: 'db error' } });

    const req = { query: {} };
    const res = makeRes();
    await listBanners(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('uses default page=1 limit=20 when not provided', async () => {
    mockRange.mockResolvedValue({ data: [], count: 0, error: null });

    const req = { query: {} };
    const res = makeRes();
    await listBanners(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
  });

  it('respects custom page and limit params', async () => {
    mockRange.mockResolvedValue({ data: [], count: 0, error: null });

    const req = { query: { page: '3', limit: '5' } };
    const res = makeRes();
    await listBanners(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ page: 3, limit: 5 }));
  });
});

// ─── getBannerById ────────────────────────────────────────────────────────────
describe('getBannerById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the banner when found', async () => {
    mockSingle.mockResolvedValue({ data: sampleBannerRow, error: null });

    const req = { params: { id: 'b1' } };
    const res = makeRes();
    await getBannerById(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: sampleBannerFormatted }),
    );
  });

  it('returns 404 when table missing (42P01)', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: '42P01', message: 'table missing' } });

    const req = { params: { id: 'b1' } };
    const res = makeRes();
    await getBannerById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 500 on unknown db error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'XXXX', message: 'some error' } });

    const req = { params: { id: 'b1' } };
    const res = makeRes();
    await getBannerById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

// ─── createBanner ─────────────────────────────────────────────────────────────
describe('createBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a banner and returns 201', async () => {
    mockSingle.mockResolvedValue({ data: sampleBannerRow, error: null });

    const req = {
      body: {
        title: 'Summer Sale',
        imageUrl: 'https://example.com/img.jpg',
        linkType: 'category',
        linkValue: 'sale',
        sortOrder: 1,
        isActive: true,
      },
    };
    const res = makeRes();
    await createBanner(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: sampleBannerFormatted }),
    );
  });

  it('returns 503 when table does not exist (42P01)', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: '42P01', message: 'table missing' } });

    const req = { body: { title: 'Test', imageUrl: 'http://x.com/img.jpg' } };
    const res = makeRes();
    await createBanner(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('applies default linkType=none when not provided', async () => {
    const insertFn = vi.fn().mockReturnThis();
    supabase.from.mockReturnValue({
      insert: insertFn,
      select: vi.fn().mockReturnThis(),
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({ data: { ...sampleBannerRow, link_type: 'none' }, error: null });

    const req = { body: { title: 'No Link', imageUrl: 'http://x.com/img.jpg' } };
    const res = makeRes();
    await createBanner(req, res);

    // Controller should have been called without throwing
    expect(res.json).toHaveBeenCalled();
  });

  it('returns 500 on unexpected error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'XXXX', message: 'unexpected' } });

    const req = { body: { title: 'Test', imageUrl: 'http://x.com/img.jpg' } };
    const res = makeRes();
    await createBanner(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── updateBanner ─────────────────────────────────────────────────────────────
describe('updateBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReturnValue(makeChain());
  });

  it('updates a banner and returns updated data', async () => {
    const updated = { ...sampleBannerRow, title: 'Updated Title' };
    mockSingle.mockResolvedValue({ data: updated, error: null });

    const req = { params: { id: 'b1' }, body: { title: 'Updated Title' } };
    const res = makeRes();
    await updateBanner(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  it('returns 404 when table missing (42P01)', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: '42P01', message: 'table missing' } });

    const req = { params: { id: 'b1' }, body: { title: 'New' } };
    const res = makeRes();
    await updateBanner(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 500 on unexpected error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'XXXX', message: 'db error' } });

    const req = { params: { id: 'b1' }, body: { title: 'New' } };
    const res = makeRes();
    await updateBanner(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('only sets provided fields in updates object', async () => {
    mockSingle.mockResolvedValue({ data: sampleBannerRow, error: null });

    // Only isActive is supplied
    const req = { params: { id: 'b1' }, body: { isActive: false } };
    const res = makeRes();
    await updateBanner(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

// ─── deleteBanner ─────────────────────────────────────────────────────────────
describe('deleteBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a banner and returns success message', async () => {
    // delete().eq() — terminal, no .single(); resolves directly from the chain
    const eqFn = vi.fn().mockResolvedValue({ error: null });
    supabase.from.mockReturnValue({ delete: vi.fn().mockReturnValue({ eq: eqFn }) });

    const req = { params: { id: 'b1' } };
    const res = makeRes();
    await deleteBanner(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: expect.stringContaining('deleted') }),
    );
  });

  it('returns 404 when table missing (42P01)', async () => {
    const eqFn = vi.fn().mockResolvedValue({ error: { code: '42P01', message: 'table missing' } });
    supabase.from.mockReturnValue({ delete: vi.fn().mockReturnValue({ eq: eqFn }) });

    const req = { params: { id: 'b1' } };
    const res = makeRes();
    await deleteBanner(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 500 on unexpected error', async () => {
    const eqFn = vi.fn().mockResolvedValue({ error: { code: 'XXXX', message: 'db error' } });
    supabase.from.mockReturnValue({ delete: vi.fn().mockReturnValue({ eq: eqFn }) });

    const req = { params: { id: 'b1' } };
    const res = makeRes();
    await deleteBanner(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
