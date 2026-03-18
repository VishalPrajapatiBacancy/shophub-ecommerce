import { API_BASE_URL } from '@/config/constants';
import type { User } from '@/types';

export interface LoginResponse {
  success: boolean;
  data?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
  message?: string;
}

export async function loginWithApi(email: string, password: string): Promise<LoginResponse> {
  const url = `${API_BASE_URL}/users/login`;
  const res = await fetch(url.startsWith('http') ? url : `${window.location.origin}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) {
    return { success: false, message: json.message || 'Login failed' };
  }
  return json;
}

export function userFromLoginData(data: LoginResponse['data']): User | null {
  if (!data) return null;
  return {
    id: data._id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
}
