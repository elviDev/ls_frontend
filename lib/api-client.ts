const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private onUnauthorized?: () => void;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL!) {
    this.baseURL = baseURL;
    // Try to get token from localStorage on initialization
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth-token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth-token", token);
      } else {
        localStorage.removeItem("auth-token");
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const config: RequestInit = {
      credentials: "include",
      ...options,
    };

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    config.headers = headers;

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        // Clear token on unauthorized
        this.setToken(null);
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
      }
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  auth = {
    login: async (data: any) => {
      const result = await this.request<{ token?: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      // Store token from login response
      if (result.token) {
        this.setToken(result.token);
      }
      return result;
    },
    register: (data: any) =>
      this.request("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    registerStaff: (data: any) =>
      this.request("/auth/register-staff", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    logout: async () => {
      const result = await this.request("/auth/logout", { method: "POST" });
      // Clear token on logout
      this.setToken(null);
      return result;
    },
    me: () => this.request("/auth/me"),
    forgotPassword: (data: any) =>
      this.request("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    resetPassword: (data: any) =>
      this.request("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    verifyEmail: (data: any) =>
      this.request("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Podcasts endpoints
  podcasts = {
    getAll: (params?: any) =>
      this.request(
        `/podcasts${params ? "?" + new URLSearchParams(params) : ""}`
      ),
    getById: (id: string) => this.request(`/podcasts/${id}`),
    create: (data: any) =>
      this.request("/podcasts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      this.request(`/podcasts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/podcasts/${id}`, { method: "DELETE" }),
    getEpisodes: (id: string) => this.request(`/podcasts/${id}/episodes`),
    createEpisode: (id: string, data: any) =>
      this.request(`/podcasts/${id}/episodes`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getStats: () => this.request("/analytics/podcasts"),
  };

  // Audiobooks endpoints
  audiobooks = {
    getAll: (params?: any) =>
      this.request(
        `/audiobooks${params ? "?" + new URLSearchParams(params) : ""}`
      ),
    getById: (id: string) => this.request(`/audiobooks/${id}`),
    create: (data: any) =>
      this.request("/audiobooks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request(`/audiobooks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/audiobooks/${id}`, { method: "DELETE" }),
    getStats: () => this.request("/audiobooks/stats"),
  };

  // Broadcasts endpoints
  broadcasts = {
    getAll: (params?: any) =>
      this.request(
        `/broadcasts${params ? "?" + new URLSearchParams(params) : ""}`
      ),
    getCurrent: () => this.request("/broadcasts/current"),
    getEvents: () => this.request("/broadcasts/events"),
    getById: (id: string) => this.request(`/broadcasts/${id}`),
    create: (data: any) =>
      this.request("/broadcasts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request(`/broadcasts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request(`/broadcasts/${id}`, { method: "DELETE" }),
  };

  // Events endpoints
  events = {
    getAll: (params?: any) =>
      this.request(`/events${params ? "?" + new URLSearchParams(params) : ""}`),
    getById: (id: string) => this.request(`/events/${id}`),
    create: (data: any) =>
      this.request("/events", { method: "POST", body: JSON.stringify(data) }),
  };

  // Programs endpoints
  programs = {
    getAll: (params?: any) =>
      this.request(
        `/programs${params ? "?" + new URLSearchParams(params) : ""}`
      ),
    getById: (id: string) => this.request(`/programs/${id}`),
    create: (data: any) =>
      this.request("/programs", { method: "POST", body: JSON.stringify(data) }),
  };

  // Chat endpoints
  chat = {
    getMessages: (broadcastId: string) =>
      this.request(`/chat/${broadcastId}/messages`),
    sendMessage: (broadcastId: string, data: any) =>
      this.request(`/chat/${broadcastId}/messages`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Upload endpoints
  upload = {
    single: (file: File, type: string) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      return this.request("/upload/single", {
        method: "POST",
        body: formData,
        headers: {},
      });
    },
  };

  // Admin endpoints
  admin = {
    analytics: () => this.request("/analytics/dashboard"),
    settings: {
      get: () => this.request("/settings"),
      update: (data: any) =>
        this.request("/settings", {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      reset: () => this.request("/settings/reset", { method: "POST" }),
    },
    staff: (params?: any) =>
      this.request(`/staff${params ? "?" + new URLSearchParams(params) : ""}`),
    users: (params?: any) =>
      this.request(`/users${params ? "?" + new URLSearchParams(params) : ""}`),
    assets: (params?: any) =>
      this.request(`/assets${params ? "?" + new URLSearchParams(params) : ""}`),
    archives: (params?: any) =>
      this.request(
        `/archives${params ? "?" + new URLSearchParams(params) : ""}`
      ),
    podcasts: (params?: any) =>
      this.request(
        `/podcasts${params ? "?" + new URLSearchParams(params) : ""}`
      ),
    audiobooks: (params?: any) =>
      this.request(
        `/audiobooks${params ? "?" + new URLSearchParams(params) : ""}`
      ),
    schedules: (params?: any) =>
      this.request(
        `/schedules${params ? "?" + new URLSearchParams(params) : ""}`
      ),
    events: (params?: any) =>
      this.request(`/events${params ? "?" + new URLSearchParams(params) : ""}`),
  };

  // Analytics endpoints
  analytics = {
    dashboard: () => this.request("/analytics/dashboard"),
    podcasts: () => this.request("/analytics/podcasts"),
    audiobooks: () => this.request("/analytics/audiobooks"),
  };
}

export const apiClient = new ApiClient();

// Initialize token from cookie if available
if (typeof window !== "undefined") {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (token) {
    apiClient.setToken(token);
  }
}

export default apiClient;
