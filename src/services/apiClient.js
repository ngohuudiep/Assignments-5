import { API_CONFIG } from '../constants/config';

/**
 * ApiClient: Đóng gói việc gửi request HTTP (GET, POST, PUT, DELETE)
 * Có hỗ trợ timeout và xử lý lỗi mạng tập trung.
 */
class ApiClient {
  constructor(baseUrl, timeout = 10000) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeout = timeout;
  }

  setBaseUrl(newUrl) {
    this.baseUrl = newUrl.replace(/\/+$/, '');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options.headers || {}),
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`HTTP Error ${response.status}: ${errorText || response.statusText}`);
      }

      const text = await response.text().catch(() => '');
      if (!text || text.trim() === '') {
        return null;
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        return text;
      }
    } catch (error) {
      clearTimeout(timer);
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu kết nối quá thời gian chờ (Timeout).');
      }
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);
