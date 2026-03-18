import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Supabase mock ─────────────────────────────────────────────────────────────
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();

function makeChain() {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  };
}

vi.mock('../src/config/database.js', () => {
  const from = vi.fn(() => makeChain());
  return { supabase: { from }, default: { from } };
});

import { supabase } from '../src/config/database.js';
import { getCart, updateCart, addToCart, removeFromCart, clearCart } from '../src/controllers/public/cart.controller.js';

function makeRes() {
  const res = { json: vi.fn(), status: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const userId = 'user-001';
const sampleProduct = { id: 'p1', name: 'Widget', price: 99.99, stock: 10, image: 'https://img.jpg', images: [], status: 'active' };
const sampleCartItems = [{ productId: 'p1', quantity: 2, price: 99.99, name: 'Widget', image: 'https://img.jpg' }];
const sampleCartRow = { id: 'cart-1', user_id: userId, items: JSON.stringify(sampleCartItems), currency: 'USD', updated_at: '2026-01-01T00:00:00Z' };

// ─── getCart ───────────────────────────────────────────────────────────────────
describe('getCart', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty cart when no cart exists', async () => {
    supabase.from.mockImplementation(() => {
      const chain = makeChain();
      chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      return chain;
    });

    const req = { user: { _id: userId } };
    const res = makeRes();
    await getCart(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: { items: [], total: 0, currency: 'USD' } }),
    );
  });

  it('returns cart with enriched items', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'carts') {
        chain.maybeSingle = vi.fn().mockResolvedValue({ data: sampleCartRow, error: null });
      } else if (table === 'products') {
        chain.in = vi.fn().mockResolvedValue({ data: [sampleProduct], error: null });
      }
      return chain;
    });

    const req = { user: { _id: userId } };
    const res = makeRes();
    await getCart(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data.items.length).toBe(1);
    expect(payload.data.items[0].productId).toBe('p1');
    expect(payload.data.total).toBeCloseTo(199.98, 2);
  });

  it('returns 500 on db error', async () => {
    supabase.from.mockImplementation(() => {
      const chain = makeChain();
      chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } });
      return chain;
    });

    const req = { user: { _id: userId } };
    const res = makeRes();
    await getCart(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── addToCart ─────────────────────────────────────────────────────────────────
describe('addToCart', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when productId is missing', async () => {
    const req = { user: { _id: userId }, body: {} };
    const res = makeRes();
    await addToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 404 when product not found', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'products') {
        chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      }
      return chain;
    });

    const req = { user: { _id: userId }, body: { productId: 'p-nonexistent' } };
    const res = makeRes();
    await addToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 400 when product is not active', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'products') {
        chain.maybeSingle = vi.fn().mockResolvedValue({
          data: { ...sampleProduct, status: 'inactive' },
          error: null,
        });
      }
      return chain;
    });

    const req = { user: { _id: userId }, body: { productId: 'p1', quantity: 1 } };
    const res = makeRes();
    await addToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 400 when quantity exceeds stock', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'products') {
        chain.maybeSingle = vi.fn().mockResolvedValue({
          data: { ...sampleProduct, stock: 2 },
          error: null,
        });
      } else if (table === 'carts') {
        chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      }
      return chain;
    });

    const req = { user: { _id: userId }, body: { productId: 'p1', quantity: 5 } };
    const res = makeRes();
    await addToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('adds item and returns updated cart', async () => {
    const updatedCart = { ...sampleCartRow, items: JSON.stringify(sampleCartItems) };
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'products') {
        chain.maybeSingle = vi.fn()
          .mockResolvedValueOnce({ data: sampleProduct, error: null })  // product lookup
          .mockResolvedValue({ data: sampleProduct, error: null });      // enrichItems
        chain.in = vi.fn().mockResolvedValue({ data: [sampleProduct], error: null });
      } else if (table === 'carts') {
        chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
        chain.single = vi.fn().mockResolvedValue({ data: updatedCart, error: null });
      }
      return chain;
    });

    const req = { user: { _id: userId }, body: { productId: 'p1', quantity: 1 } };
    const res = makeRes();
    await addToCart(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Item added to cart',
    }));
  });
});

// ─── updateCart ────────────────────────────────────────────────────────────────
describe('updateCart', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when items is not an array', async () => {
    const req = { user: { _id: userId }, body: { items: 'invalid' } };
    const res = makeRes();
    await updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('replaces cart items successfully', async () => {
    const updatedCart = { ...sampleCartRow };
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'carts') {
        chain.single = vi.fn().mockResolvedValue({ data: updatedCart, error: null });
      } else if (table === 'products') {
        chain.in = vi.fn().mockResolvedValue({ data: [sampleProduct], error: null });
      }
      return chain;
    });

    const req = {
      user: { _id: userId },
      body: { items: [{ productId: 'p1', quantity: 3, price: 99.99 }] },
    };
    const res = makeRes();
    await updateCart(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Cart updated' }));
  });
});

// ─── clearCart ─────────────────────────────────────────────────────────────────
describe('clearCart', () => {
  beforeEach(() => vi.clearAllMocks());

  it('clears cart and returns success', async () => {
    supabase.from.mockImplementation(() => {
      const chain = makeChain();
      chain.upsert = vi.fn().mockResolvedValue({ error: null });
      return chain;
    });

    const req = { user: { _id: userId } };
    const res = makeRes();
    await clearCart(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'Cart cleared', data: { items: [], total: 0 } }),
    );
  });

  it('returns 500 on db error', async () => {
    supabase.from.mockImplementation(() => {
      const chain = makeChain();
      chain.upsert = vi.fn().mockResolvedValue({ error: { message: 'db error' } });
      return chain;
    });

    const req = { user: { _id: userId } };
    const res = makeRes();
    await clearCart(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
