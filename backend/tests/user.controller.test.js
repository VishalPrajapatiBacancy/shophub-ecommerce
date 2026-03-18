import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks (vi.mock factory is hoisted, so fns must be too) ────────────
const { mockAdminCreateUser, mockSignInWithPassword, mockMaybeSingle, mockSingle } = vi.hoisted(() => ({
  mockAdminCreateUser: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockMaybeSingle: vi.fn(),
  mockSingle: vi.fn(),
}));

function makeChain() {
  return {
    select: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
  };
}

vi.mock('../src/config/database.js', () => {
  const from = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
  }));
  const auth = {
    admin: { createUser: mockAdminCreateUser },
    signInWithPassword: mockSignInWithPassword,
  };
  return { supabase: { from, auth }, default: { from, auth } };
});

import { supabase } from '../src/config/database.js';
import { registerUser, loginUser } from '../src/controllers/user.controller.js';

function makeRes() {
  const res = { json: vi.fn(), status: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

const sampleAuthUser = {
  id: 'uid-001',
  email: 'test@example.com',
  user_metadata: { name: 'Test User', role: 'user' },
};
const sampleSession = { access_token: 'jwt-token-abc' };
const sampleProfile = { id: 'uid-001', name: 'Test User', email: 'test@example.com', role: 'user', is_active: true };

// ─── registerUser ──────────────────────────────────────────────────────────────
describe('registerUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when name is missing', async () => {
    const req = { body: { email: 'a@b.com', password: 'pass123' } };
    const res = makeRes();
    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Name, email and password are required' }),
    );
  });

  it('returns 400 when email is missing', async () => {
    const req = { body: { name: 'Test', password: 'pass123' } };
    const res = makeRes();
    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when password is missing', async () => {
    const req = { body: { name: 'Test', email: 'a@b.com' } };
    const res = makeRes();
    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when Supabase admin.createUser fails', async () => {
    mockAdminCreateUser.mockResolvedValue({
      data: null,
      error: { message: 'User already registered' },
    });

    const req = { body: { name: 'Test', email: 'a@b.com', password: 'pass123' } };
    const res = makeRes();
    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'User already registered' }),
    );
  });

  it('does NOT trigger email confirmation (uses admin.createUser with email_confirm: true)', async () => {
    mockAdminCreateUser.mockResolvedValue({ data: { user: sampleAuthUser }, error: null });
    mockSignInWithPassword.mockResolvedValue({
      data: { session: sampleSession },
      error: null,
    });
    supabase.from.mockReturnValue(makeChain());

    const req = { body: { name: 'Test User', email: 'test@example.com', password: 'pass123' } };
    const res = makeRes();
    await registerUser(req, res);

    // Verify admin.createUser was called with email_confirm: true (no email sent)
    expect(mockAdminCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({ email_confirm: true }),
    );
  });

  it('returns 400 when signInWithPassword fails after user creation', async () => {
    mockAdminCreateUser.mockResolvedValue({ data: { user: sampleAuthUser }, error: null });
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });
    supabase.from.mockReturnValue(makeChain());

    const req = { body: { name: 'Test User', email: 'test@example.com', password: 'pass123' } };
    const res = makeRes();
    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 201 with user data and token on success', async () => {
    mockAdminCreateUser.mockResolvedValue({ data: { user: sampleAuthUser }, error: null });
    mockSignInWithPassword.mockResolvedValue({
      data: { session: sampleSession },
      error: null,
    });
    supabase.from.mockReturnValue(makeChain());

    const req = { body: { name: 'Test User', email: 'test@example.com', password: 'pass123' } };
    const res = makeRes();
    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          _id: 'uid-001',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          token: 'jwt-token-abc',
        }),
      }),
    );
  });
});

// ─── loginUser ─────────────────────────────────────────────────────────────────
describe('loginUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when email is missing', async () => {
    const req = { body: { password: 'pass123' } };
    const res = makeRes();
    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Email and password are required' }),
    );
  });

  it('returns 400 when password is missing', async () => {
    const req = { body: { email: 'a@b.com' } };
    const res = makeRes();
    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 401 when Supabase signIn fails (wrong credentials)', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    const req = { body: { email: 'a@b.com', password: 'wrongpass' } };
    const res = makeRes();
    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Invalid email or password' }),
    );
  });

  it('returns 403 when user account is inactive', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'uid-001', user_metadata: { name: 'Test' } },
        session: sampleSession,
      },
      error: null,
    });
    mockMaybeSingle.mockResolvedValue({
      data: { ...sampleProfile, is_active: false },
      error: null,
    });

    const req = { body: { email: 'test@example.com', password: 'pass123' } };
    const res = makeRes();
    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'User account is inactive' }),
    );
  });

  it('returns 200 with user data and token on success', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'uid-001', user_metadata: { name: 'Test User', role: 'user' } },
        session: sampleSession,
      },
      error: null,
    });
    mockMaybeSingle.mockResolvedValue({ data: sampleProfile, error: null });

    const req = { body: { email: 'test@example.com', password: 'pass123' } };
    const res = makeRes();
    await loginUser(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          _id: 'uid-001',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          token: 'jwt-token-abc',
        }),
      }),
    );
  });

  it('falls back to auth metadata when profile is not in users table', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'uid-001', user_metadata: { name: 'Meta User', role: 'user' } },
        session: sampleSession,
      },
      error: null,
    });
    // First maybeSingle returns no profile
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    supabase.from.mockReturnValue({
      ...makeChain(),
      maybeSingle: mockMaybeSingle,
      upsert: vi.fn().mockResolvedValue({ error: null }),
    });

    const req = { body: { email: 'test@example.com', password: 'pass123' } };
    const res = makeRes();
    await loginUser(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ token: 'jwt-token-abc' }),
      }),
    );
  });
});
