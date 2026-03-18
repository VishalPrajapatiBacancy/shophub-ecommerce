import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Supabase mock ─────────────────────────────────────────────────────────────
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
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
    range: mockRange,
    catch: vi.fn().mockReturnThis(),
  };
}

vi.mock('../src/config/database.js', () => {
  const from = vi.fn(() => makeChain());
  const rpc = vi.fn().mockReturnValue({ catch: vi.fn() });
  return { supabase: { from, rpc }, default: { from, rpc } };
});

import { supabase } from '../src/config/database.js';
import { createOrder, getOrders, getOrderById, cancelOrder } from '../src/controllers/public/order.controller.js';

function makeRes() {
  const res = { json: vi.fn(), status: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const userId = 'user-001';
const sampleProduct = { id: 'p1', name: 'Widget', price: 99.99, stock: 10, status: 'active' };

const sampleOrderRow = {
  id: 'ord-1',
  order_number: 'ORD-ABC123',
  status: 'placed',
  payment_method: 'cod',
  payment_status: 'pending',
  total: 99.99,
  subtotal: 99.99,
  tax: 0,
  shipping: 0,
  discount: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  tracking_number: null,
};

// ─── createOrder ───────────────────────────────────────────────────────────────
describe('createOrder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when items array is empty', async () => {
    const req = { user: { _id: userId }, body: { items: [], shippingAddress: {}, paymentMethod: 'cod' } };
    const res = makeRes();
    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 400 when shippingAddress is missing', async () => {
    const req = {
      user: { _id: userId },
      body: { items: [{ productId: 'p1', quantity: 1 }], paymentMethod: 'cod' },
    };
    const res = makeRes();
    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when paymentMethod is missing', async () => {
    const req = {
      user: { _id: userId },
      body: { items: [{ productId: 'p1', quantity: 1 }], shippingAddress: {} },
    };
    const res = makeRes();
    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when product not found', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'products') {
        chain.in = vi.fn().mockResolvedValue({ data: [], error: null });
      }
      return chain;
    });

    const req = {
      user: { _id: userId },
      body: {
        items: [{ productId: 'p-nonexistent', quantity: 1 }],
        shippingAddress: { line1: '123 Street', city: 'Mumbai' },
        paymentMethod: 'cod',
      },
    };
    const res = makeRes();
    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when product is not active', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'products') {
        chain.in = vi.fn().mockResolvedValue({ data: [{ ...sampleProduct, status: 'inactive' }], error: null });
      }
      return chain;
    });

    const req = {
      user: { _id: userId },
      body: {
        items: [{ productId: 'p1', quantity: 1 }],
        shippingAddress: { line1: '123 Street', city: 'Mumbai' },
        paymentMethod: 'cod',
      },
    };
    const res = makeRes();
    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates order successfully and returns 201', async () => {
    supabase.from.mockImplementation((table) => {
      const chain = makeChain();
      if (table === 'products') {
        chain.in = vi.fn().mockResolvedValue({ data: [sampleProduct], error: null });
        chain.update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
      } else if (table === 'coupons') {
        chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      } else if (table === 'orders') {
        chain.single = vi.fn().mockResolvedValue({ data: sampleOrderRow, error: null });
      } else if (table === 'order_items') {
        chain.insert = vi.fn().mockResolvedValue({ error: null });
      }
      return chain;
    });

    const req = {
      user: { _id: userId },
      body: {
        items: [{ productId: 'p1', quantity: 1 }],
        shippingAddress: { line1: '123 Street', city: 'Mumbai', state: 'MH', postalCode: '400001' },
        paymentMethod: 'cod',
      },
    };
    const res = makeRes();
    await createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Order placed successfully' }));
  });
});

// ─── getOrders ─────────────────────────────────────────────────────────────────
describe('getOrders', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns paginated orders for user', async () => {
    mockRange.mockResolvedValue({ data: [sampleOrderRow], error: null, count: 1 });

    const req = { user: { _id: userId }, query: { page: '1', limit: '10' } };
    const res = makeRes();
    await getOrders(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, count: 1, page: 1, limit: 10 }),
    );
  });

  it('returns empty list when no orders', async () => {
    mockRange.mockResolvedValue({ data: [], error: null, count: 0 });

    const req = { user: { _id: userId }, query: {} };
    const res = makeRes();
    await getOrders(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 0, data: [] }));
  });

  it('returns 500 on db error', async () => {
    mockRange.mockResolvedValue({ data: null, error: { message: 'db error' }, count: null });

    const req = { user: { _id: userId }, query: {} };
    const res = makeRes();
    await getOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── cancelOrder ──────────────────────────────────────────────────────────────
describe('cancelOrder', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when order not found', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const req = { user: { _id: userId }, params: { id: 'ord-1' } };
    const res = makeRes();
    await cancelOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 when order status cannot be cancelled', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: 'ord-1', status: 'shipped', order_items: [] },
      error: null,
    });

    const req = { user: { _id: userId }, params: { id: 'ord-1' } };
    const res = makeRes();
    await cancelOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('cancels order and returns success', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { id: 'ord-1', status: 'placed', order_items: [] },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: { id: 'ord-1', order_number: 'ORD-ABC', status: 'cancelled', updated_at: '2026-01-01T00:00:00Z' },
      error: null,
    });

    const req = { user: { _id: userId }, params: { id: 'ord-1' } };
    const res = makeRes();
    await cancelOrder(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'Order cancelled successfully' }),
    );
  });
});
