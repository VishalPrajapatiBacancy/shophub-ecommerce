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
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: mockRange,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  };
}

vi.mock('../src/config/database.js', () => {
  const from = vi.fn(() => makeChain());
  const auth = { getUser: vi.fn() };
  return { supabase: { from, auth }, default: { from, auth } };
});

import { supabase } from '../src/config/database.js';
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
} from '../src/controllers/admin/support.controller.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeRes() {
  const res = { json: vi.fn(), status: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const sampleTicketRow = {
  id: 't1',
  ticket_number: 'TKT-000001',
  subject: 'Cannot log in',
  user_id: 'u1',
  customer_name: 'Alice',
  customer_email: 'alice@example.com',
  category: 'general',
  priority: 'medium',
  status: 'open',
  assigned_to: null,
  message: 'I cannot log in to my account.',
  messages: [],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

// ─── listTickets ──────────────────────────────────────────────────────────────
describe('listTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReturnValue(makeChain());
  });

  it('returns paginated tickets on success', async () => {
    mockRange.mockResolvedValue({ data: [sampleTicketRow], count: 1, error: null });

    const req = { query: { page: '1', limit: '20' } };
    const res = makeRes();
    await listTickets(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, total: 1, data: expect.any(Array) }),
    );
  });

  it('returns empty list when table missing (42P01)', async () => {
    mockRange.mockResolvedValue({ data: null, count: null, error: { code: '42P01', message: 'table missing' } });

    const req = { query: {} };
    const res = makeRes();
    await listTickets(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: [], total: 0 }),
    );
  });

  it('returns 500 on unexpected db error', async () => {
    mockRange.mockResolvedValue({ data: null, count: null, error: { code: 'XXXX', message: 'db error' } });

    const req = { query: {} };
    const res = makeRes();
    await listTickets(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('maps row fields to camelCase response', async () => {
    mockRange.mockResolvedValue({ data: [sampleTicketRow], count: 1, error: null });

    const req = { query: {} };
    const res = makeRes();
    await listTickets(req, res);

    const payload = res.json.mock.calls[0][0];
    const ticket = payload.data[0];
    expect(ticket.ticketNumber).toBe('TKT-000001');
    expect(ticket.customerName).toBe('Alice');
    expect(ticket.category).toBe('general');
    expect(ticket.priority).toBe('medium');
  });

  it('uses default page=1 limit=20 when not provided', async () => {
    mockRange.mockResolvedValue({ data: [], count: 0, error: null });

    const req = { query: {} };
    const res = makeRes();
    await listTickets(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
  });
});

// ─── getTicket ────────────────────────────────────────────────────────────────
describe('getTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReturnValue(makeChain());
  });

  it('returns the ticket when found', async () => {
    mockSingle.mockResolvedValue({ data: sampleTicketRow, error: null });

    const req = { params: { id: 't1' } };
    const res = makeRes();
    await getTicket(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: sampleTicketRow }),
    );
  });

  it('returns 500 on db error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } });

    const req = { params: { id: 'nonexistent' } };
    const res = makeRes();
    await getTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── createTicket ─────────────────────────────────────────────────────────────
describe('createTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReturnValue(makeChain());
  });

  it('creates a ticket and returns 201', async () => {
    mockSingle.mockResolvedValue({ data: sampleTicketRow, error: null });

    const req = {
      body: {
        subject: 'Cannot log in',
        customerName: 'Alice',
        customerEmail: 'alice@example.com',
        category: 'general',
        priority: 'medium',
        message: 'I cannot log in to my account.',
      },
    };
    const res = makeRes();
    await createTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 400 when subject is missing', async () => {
    const req = { body: { customerName: 'Alice' } };
    const res = makeRes();
    await createTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringContaining('Subject') }),
    );
  });

  it('includes both message (text) and messages (array) in the insert', async () => {
    const insertFn = vi.fn().mockReturnThis();
    const selectFn = vi.fn().mockReturnThis();
    supabase.from.mockReturnValue({
      insert: insertFn,
      select: selectFn,
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({ data: sampleTicketRow, error: null });

    const req = {
      body: { subject: 'Test', message: 'Hello support' },
    };
    const res = makeRes();
    await createTicket(req, res);

    const insertedRecord = insertFn.mock.calls[0][0][0];
    expect(insertedRecord.message).toBe('Hello support');
    expect(Array.isArray(insertedRecord.messages)).toBe(true);
    expect(insertedRecord.messages[0].text).toBe('Hello support');
  });

  it('sets message to empty string when not provided', async () => {
    const insertFn = vi.fn().mockReturnThis();
    const selectFn = vi.fn().mockReturnThis();
    supabase.from.mockReturnValue({
      insert: insertFn,
      select: selectFn,
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({ data: sampleTicketRow, error: null });

    const req = { body: { subject: 'Test' } };
    const res = makeRes();
    await createTicket(req, res);

    const insertedRecord = insertFn.mock.calls[0][0][0];
    expect(insertedRecord.message).toBe('');
    expect(insertedRecord.messages).toEqual([]);
  });

  it('falls back gracefully when table missing (42P01)', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: '42P01', message: 'table missing' } });

    const req = { body: { subject: 'Test', message: 'Hello' } };
    const res = makeRes();
    await createTicket(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 500 on unexpected db error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'XXXX', message: 'unexpected' } });

    const req = { body: { subject: 'Test' } };
    const res = makeRes();
    await createTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── updateTicket ─────────────────────────────────────────────────────────────
describe('updateTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReturnValue(makeChain());
  });

  it('updates a ticket and returns updated data', async () => {
    mockSingle.mockResolvedValue({ data: { ...sampleTicketRow, status: 'resolved' }, error: null });

    const req = { params: { id: 't1' }, body: { status: 'resolved' } };
    const res = makeRes();
    await updateTicket(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('falls back gracefully when table missing (42P01)', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: '42P01', message: 'table missing' } });

    const req = { params: { id: 't1' }, body: { status: 'resolved' } };
    const res = makeRes();
    await updateTicket(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('returns 500 on unexpected db error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'XXXX', message: 'db error' } });

    const req = { params: { id: 't1' }, body: { status: 'resolved' } };
    const res = makeRes();
    await updateTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('only updates provided fields', async () => {
    const updateFn = vi.fn().mockReturnThis();
    supabase.from.mockReturnValue({
      update: updateFn,
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({ data: sampleTicketRow, error: null });

    const req = { params: { id: 't1' }, body: { priority: 'high' } };
    const res = makeRes();
    await updateTicket(req, res);

    const updateArg = updateFn.mock.calls[0][0];
    expect(updateArg.priority).toBe('high');
    expect(updateArg.status).toBeUndefined();
  });
});
