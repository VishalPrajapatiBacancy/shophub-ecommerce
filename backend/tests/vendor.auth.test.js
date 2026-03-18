import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
const { mockSignInWithPassword, mockMaybeSingle, mockGetUser } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockMaybeSingle: vi.fn(),
  mockGetUser: vi.fn(),
}));

function makeChain() {
  return {
    select: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: mockMaybeSingle,
  };
}

vi.mock('../src/config/database.js', () => {
  const from = vi.fn(() => makeChain());
  const auth = {
    signInWithPassword: mockSignInWithPassword,
    getUser: mockGetUser,
  };
  return { supabase: { from, auth }, default: { from, auth } };
});

import { supabase } from '../src/config/database.js';
import { loginUser } from '../src/controllers/user.controller.js';
import { protect, admin } from '../src/middleware/auth.middleware.js';

function makeRes() {
  const res = { json: vi.fn(), status: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const vendorAuthUser = {
  id: 'vendor-uid-001',
  email: 'vendor@shophub.com',
  user_metadata: { name: 'TechZone Store', role: 'vendor' },
};
const vendorSession = { access_token: 'vendor-jwt-token-xyz' };
const vendorProfile = {
  id: 'vendor-uid-001',
  name: 'TechZone Store',
  email: 'vendor@shophub.com',
  role: 'vendor',
  is_active: true,
};

// ─── loginUser — vendor scenarios ─────────────────────────────────────────────
describe('loginUser — vendor account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReturnValue(makeChain());
  });

  it('returns 200 with role=vendor when vendor profile exists in users table', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: vendorAuthUser, session: vendorSession },
      error: null,
    });
    mockMaybeSingle.mockResolvedValue({ data: vendorProfile, error: null });

    const req = { body: { email: 'vendor@shophub.com', password: 'vendor123' } };
    const res = makeRes();
    await loginUser(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          _id: 'vendor-uid-001',
          email: 'vendor@shophub.com',
          role: 'vendor',
          token: 'vendor-jwt-token-xyz',
        }),
      }),
    );
  });

  it('returns role=vendor from auth metadata when profile not in users table', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: vendorAuthUser, session: vendorSession },
      error: null,
    });
    // No profile in DB
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    supabase.from.mockReturnValue({
      ...makeChain(),
      maybeSingle: mockMaybeSingle,
      upsert: vi.fn().mockResolvedValue({ error: null }),
    });

    const req = { body: { email: 'vendor@shophub.com', password: 'vendor123' } };
    const res = makeRes();
    await loginUser(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ role: 'vendor' }),
      }),
    );
  });

  it('returns 401 for wrong vendor password', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    const req = { body: { email: 'vendor@shophub.com', password: 'wrongpass' } };
    const res = makeRes();
    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Invalid email or password' }),
    );
  });

  it('returns 403 when vendor account is inactive', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: vendorAuthUser, session: vendorSession },
      error: null,
    });
    mockMaybeSingle.mockResolvedValue({
      data: { ...vendorProfile, is_active: false },
      error: null,
    });

    const req = { body: { email: 'vendor@shophub.com', password: 'vendor123' } };
    const res = makeRes();
    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'User account is inactive' }),
    );
  });
});

// ─── auth.middleware — protect + admin for vendor ─────────────────────────────
describe('protect + admin middleware — vendor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReturnValue(makeChain());
  });

  it('protect: sets req.user with role=vendor when vendor profile exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: vendorAuthUser }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: vendorProfile, error: null });

    const req = { headers: { authorization: 'Bearer vendor-jwt' } };
    const res = makeRes();
    const next = vi.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('vendor');
    expect(req.user.email).toBe('vendor@shophub.com');
  });

  it('admin middleware: allows vendor role through', () => {
    const req = { user: { role: 'vendor', id: 'vendor-uid-001' } };
    const res = makeRes();
    const next = vi.fn();

    admin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('admin middleware: allows admin role through', () => {
    const req = { user: { role: 'admin', id: 'admin-uid-001' } };
    const res = makeRes();
    const next = vi.fn();

    admin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('admin middleware: blocks customer role', () => {
    const req = { user: { role: 'customer', id: 'cust-001' } };
    const res = makeRes();
    const next = vi.fn();

    admin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('admin middleware: blocks unauthenticated request (no user)', () => {
    const req = {};
    const res = makeRes();
    const next = vi.fn();

    admin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('protect: returns 401 when no Authorization header', async () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = vi.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('protect: auto-creates vendor profile with role=vendor from metadata', async () => {
    mockGetUser.mockResolvedValue({ data: { user: vendorAuthUser }, error: null });
    // No profile returned on first maybeSingle (profile missing), second returns created profile
    mockMaybeSingle
      .mockResolvedValueOnce({ data: null, error: null })   // profile lookup
      .mockResolvedValueOnce({ data: vendorProfile, error: null }); // after upsert

    // Chain: upsert().select().maybeSingle()
    const selectAfterUpsert = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const upsertMock = vi.fn().mockReturnValue({ select: selectAfterUpsert });
    supabase.from.mockReturnValue({ ...makeChain(), maybeSingle: mockMaybeSingle, upsert: upsertMock });

    const req = { headers: { authorization: 'Bearer vendor-jwt' } };
    const res = makeRes();
    const next = vi.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('vendor');
  });
});
