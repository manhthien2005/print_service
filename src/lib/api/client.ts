import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: unknown) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear auth and redirect
          this.clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error
      const message =
        (error.response.data as { message?: string })?.message ||
        error.message ||
        'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  public get<T = unknown>(url: string, config?: InternalAxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  public post<T = unknown>(
    url: string,
    data?: unknown,
    config?: InternalAxiosRequestConfig
  ) {
    return this.client.post<T>(url, data, config);
  }

  public put<T = unknown>(
    url: string,
    data?: unknown,
    config?: InternalAxiosRequestConfig
  ) {
    return this.client.put<T>(url, data, config);
  }

  public patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: InternalAxiosRequestConfig
  ) {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T = unknown>(url: string, config?: InternalAxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
