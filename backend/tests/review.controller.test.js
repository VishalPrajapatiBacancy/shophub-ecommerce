import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Supabase mock ────────────────────────────────────────────────────────────
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockRange = vi.fn();

function makeChain() {
  return {
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
}

vi.mock('../src/config/database.js', () => {
  const from = vi.fn(() => makeChain());
  const auth = { getUser: vi.fn() };
  return { supabase: { from, auth }, default: { from, auth } };
});

import { supabase } from '../src/config/database.js';
import {
  listReviews,
  updateReviewStatus,
  deleteReview,
} from '../src/controllers/admin/review.controller.js';

function makeRes() {
  const res = { json: vi.fn(), status: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const sampleReviewRow = {
  id: 'r1',
  product_id: 'p1',
  user_id: 'u1',
  rating: 4,
  title: 'Great product',
  comment: 'Loved it',
  status: 'pending',
  created_at: '2026-01-01T00:00:00Z',
};

// ─── listReviews ──────────────────────────────────────────────────────────────
describe('listReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated reviews on success (no related data)', async () => {
    // First call: reviews query — returns via .range()
    // Subsequent calls for users / products — .in() then resolve via implicit promise
    let callCount = 0;
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'reviews') {
        chain.range = vi.fn().mockResolvedValue({
          data: [sampleReviewRow],
          count: 1,
          error: null,
        });
      } else {
        // users / products lookup — return empty via .in()
        chain.in = vi.fn().mockResolvedValue({ data: [], error: null });
      }
      return chain;
    });

    const req = { query: { page: '1', limit: '20' } };
    const res = makeRes();
    await listReviews(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, total: 1, data: expect.any(Array) }),
    );
  });

  it('returns empty list when reviews table is missing (42P01)', async () => {
    supabase.from.mockImplementation(() => {
      const chain = makeChain();
      chain.range = vi.fn().mockResolvedValue({
        data: null,
        count: null,
        error: { code: '42P01', message: 'table missing' },
      });
      return chain;
    });

    const req = { query: {} };
    const res = makeRes();
    await listReviews(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: [], total: 0 }),
    );
  });

  it('returns 500 on unexpected db error', async () => {
    supabase.from.mockImplementation(() => {
      const chain = makeChain();
      chain.range = vi.fn().mockResolvedValue({
        data: null,
        count: null,
        error: { code: 'XXXX', message: 'something broke' },
      });
      return chain;
    });

    const req = { query: {} };
    const res = makeRes();
    await listReviews(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('filters by status when status query param is provided', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'reviews') {
        chain.range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      } else {
        chain.in = vi.fn().mockResolvedValue({ data: [], error: null });
      }
      return chain;
    });

    const req = { query: { status: 'approved' } };
    const res = makeRes();
    await listReviews(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('enriches reviews with user and product names when available', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'reviews') {
        chain.range = vi.fn().mockResolvedValue({
          data: [sampleReviewRow],
          count: 1,
          error: null,
        });
      } else if (table === 'customer_profiles') {
        chain.in = vi.fn().mockResolvedValue({
          data: [{ user_id: 'u1', full_name: 'Alice' }],
          error: null,
        });
      } else if (table === 'products') {
        chain.in = vi.fn().mockResolvedValue({
          data: [{ id: 'p1', name: 'Widget' }],
          error: null,
        });
      }
      return chain;
    });

    const req = { query: {} };
    const res = makeRes();
    await listReviews(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data[0].customer.name).toBe('Alice');
    expect(payload.data[0].productName).toBe('Widget');
  });
});

// ─── updateReviewStatus ───────────────────────────────────────────────────────
describe('updateReviewStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReturnValue(makeChain());
  });

  it('updates status and returns the updated review', async () => {
    mockSingle.mockResolvedValue({
      data: { ...sampleReviewRow, status: 'approved' },
      error: null,
    });

    const req = { params: { id: 'r1' }, body: { status: 'approved' } };
    const res = makeRes();
    await updateReviewStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 400 when status is missing from body', async () => {
    const req = { params: { id: 'r1' }, body: {} };
    const res = makeRes();
    await updateReviewStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringContaining('status') }),
    );
  });

  it('returns 400 when db returns an error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'update failed' } });

    const req = { params: { id: 'r1' }, body: { status: 'approved' } };
    const res = makeRes();
    await updateReviewStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 when no review found after update', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });

    const req = { params: { id: 'nonexistent' }, body: { status: 'approved' } };
    const res = makeRes();
    await updateReviewStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

// ─── deleteReview ─────────────────────────────────────────────────────────────
describe('deleteReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReturnValue(makeChain());
  });

  it('deletes a review and returns success', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'r1' }, error: null });

    const req = { params: { id: 'r1' } };
    const res = makeRes();
    await deleteReview(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: expect.stringContaining('deleted') }),
    );
  });

  it('returns 404 when review does not exist', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const req = { params: { id: 'nonexistent' } };
    const res = makeRes();
    await deleteReview(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 500 on db error during delete', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'delete error' } });

    const req = { params: { id: 'r1' } };
    const res = makeRes();
    await deleteReview(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
