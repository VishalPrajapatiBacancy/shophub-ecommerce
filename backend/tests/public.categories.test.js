import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Supabase mock ─────────────────────────────────────────────────────────────
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();

function makeChain() {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  };
}

vi.mock('../src/config/database.js', () => {
  const from = vi.fn(() => makeChain());
  return { supabase: { from }, default: { from } };
});

import { supabase } from '../src/config/database.js';
import { listCategories, getCategoryById } from '../src/controllers/public/categories.controller.js';

function makeRes() {
  const res = { json: vi.fn(), status: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const sampleCategoryRow = {
  id: 'c1',
  name: 'Electronics',
  slug: 'electronics',
  parent_id: null,
  image_url: 'https://example.com/img.jpg',
  description: 'Electronic items',
  is_active: true,
  sort_order: 1,
};

const sampleCategoryFormatted = {
  id: 'c1',
  name: 'Electronics',
  slug: 'electronics',
  parentId: null,
  imageUrl: 'https://example.com/img.jpg',
  description: 'Electronic items',
  isActive: true,
  sortOrder: 1,
  productCount: 2,
};

// ─── listCategories ────────────────────────────────────────────────────────────
describe('listCategories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all active categories with product counts', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'categories') {
        chain.order = vi.fn().mockResolvedValue({ data: [sampleCategoryRow], error: null });
      } else if (table === 'products') {
        chain.eq = vi.fn().mockResolvedValue({ data: [{ category_id: 'c1' }, { category_id: 'c1' }], error: null });
      }
      return chain;
    });

    const req = { query: {} };
    const res = makeRes();
    await listCategories(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, count: 1, data: [sampleCategoryFormatted] }),
    );
  });

  it('returns 500 when database error', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'categories') {
        chain.order = vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } });
      }
      return chain;
    });

    const req = { query: {} };
    const res = makeRes();
    await listCategories(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns empty list when no categories', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'categories') {
        chain.order = vi.fn().mockResolvedValue({ data: [], error: null });
      } else if (table === 'products') {
        chain.eq = vi.fn().mockResolvedValue({ data: [], error: null });
      }
      return chain;
    });

    const req = { query: {} };
    const res = makeRes();
    await listCategories(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 0, data: [] }));
  });

  it('maps productCount to 0 when no products in category', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'categories') {
        chain.order = vi.fn().mockResolvedValue({ data: [sampleCategoryRow], error: null });
      } else if (table === 'products') {
        chain.eq = vi.fn().mockResolvedValue({ data: [], error: null });
      }
      return chain;
    });

    const req = { query: {} };
    const res = makeRes();
    await listCategories(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.data[0].productCount).toBe(0);
  });
});

// ─── getCategoryById ───────────────────────────────────────────────────────────
describe('getCategoryById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns category by UUID', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'categories') {
        chain.maybeSingle = vi.fn().mockResolvedValue({ data: sampleCategoryRow, error: null });
      } else if (table === 'products') {
        chain.eq = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ count: 2, error: null }) }),
        });
      }
      return chain;
    });

    const req = { params: { idOrSlug: 'c12345ab-1234-1234-1234-1234567890ab' } };
    const res = makeRes();
    await getCategoryById(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 404 when category not found', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'categories') {
        chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      }
      return chain;
    });

    const req = { params: { idOrSlug: 'electronics' } };
    const res = makeRes();
    await getCategoryById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 500 on db error', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'categories') {
        chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } });
      }
      return chain;
    });

    const req = { params: { idOrSlug: 'electronics' } };
    const res = makeRes();
    await getCategoryById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
