import { API_BASE_URL } from '@/config/constants';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function extractError(res: Response, fallback: string): Promise<Error> {
  try {
    const body = await res.json();
    return new Error(body.message || body.error || fallback);
  } catch {
    return new Error(fallback);
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const res = await fetch(this.buildUrl(endpoint, options?.params), {
      ...options,
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw await extractError(res, `Failed to load data (${res.status})`);
    return res.json();
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const res = await fetch(this.buildUrl(endpoint, options?.params), {
      ...options,
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) throw await extractError(res, `Request failed (${res.status})`);
    return res.json();
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const res = await fetch(this.buildUrl(endpoint, options?.params), {
      ...options,
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) throw await extractError(res, `Request failed (${res.status})`);
    return res.json();
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const res = await fetch(this.buildUrl(endpoint, options?.params), {
      ...options,
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) throw await extractError(res, `Request failed (${res.status})`);
    return res.json();
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const res = await fetch(this.buildUrl(endpoint, options?.params), {
      ...options,
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw await extractError(res, `Request failed (${res.status})`);
    return res.json();
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(this.buildUrl(endpoint), {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw await extractError(res, `Upload failed (${res.status})`);
    return res.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
