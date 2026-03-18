import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
const { mockSingle, mockMaybeSingle, mockSelect } = vi.hoisted(() => ({
  mockSingle: vi.fn(),
  mockMaybeSingle: vi.fn(),
  mockSelect: vi.fn(),
}));

function makeChain(overrides = {}) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    ...overrides,
  };
  return chain;
}

vi.mock('../src/config/database.js', () => ({
  supabase: { from: vi.fn(() => makeChain()) },
}));

import { supabase } from '../src/config/database.js';
import { updateOrderStatus } from '../src/controllers/admin/order.controller.js';

function makeRes() {
  const res = { json: vi.fn(), status: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

// ─── VALID_ORDER_STATUSES ─────────────────────────────────────────────────────
// These must match the DB check constraint exactly
const VALID_STATUSES = [
  'placed', 'confirmed', 'packed', 'processing',
  'shipped', 'out_for_delivery', 'delivered',
  'cancelled', 'returned', 'refunded',
];

const INVALID_STATUSES = ['pending', 'draft', 'unknown', 'paid', 'active'];

describe('updateOrderStatus — status validation', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(VALID_STATUSES)('accepts valid status "%s" and calls DB', async (status) => {
    supabase.from.mockReturnValue(makeChain());
    mockSingle.mockResolvedValue({
      data: { id: 'ord-1', status, order_number: 'ORD-001', updated_at: new Date().toISOString() },
      error: null,
    });

    const req = { params: { id: 'ord-1' }, body: { status } };
    const res = makeRes();
    await updateOrderStatus(req, res);

    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  it.each(INVALID_STATUSES)('rejects invalid status "%s" with 400', async (status) => {
    const req = { params: { id: 'ord-1' }, body: { status } };
    const res = makeRes();
    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
    // DB should NOT be called for invalid status
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('returns 400 when status is missing but no trackingNumber either', async () => {
    const req = { params: { id: 'ord-1' }, body: {} };
    const res = makeRes();
    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it('allows update with only trackingNumber (no status)', async () => {
    supabase.from.mockReturnValue(makeChain());
    mockSingle.mockResolvedValue({
      data: { id: 'ord-1', status: 'shipped', tracking_number: 'TRK-001', order_number: 'ORD-001' },
      error: null,
    });

    const req = { params: { id: 'ord-1' }, body: { trackingNumber: 'TRK-001' } };
    const res = makeRes();
    await updateOrderStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  it('returns 400 and the DB constraint error message when DB rejects', async () => {
    supabase.from.mockReturnValue(makeChain());
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'new row for relation "orders" violates check constraint "orders_status_check"' },
    });

    const req = { params: { id: 'ord-1' }, body: { status: 'confirmed' } };
    const res = makeRes();
    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it('returns 404 when order does not exist', async () => {
    supabase.from.mockReturnValue(makeChain());
    mockSingle.mockResolvedValue({ data: null, error: null });

    const req = { params: { id: 'nonexistent' }, body: { status: 'confirmed' } };
    const res = makeRes();
    await updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
