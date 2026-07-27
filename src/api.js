const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

function getAccessToken() {
  return localStorage.getItem('access_token');
}

function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}

function setTokens(access, refresh) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

async function authFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    return null;
  }

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      try {
        res = await fetch(url, { ...options, headers });
      } catch {
        return null;
      }
    } else {
      clearTokens();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return null;
    }
  }

  return res;
}

export const api = {
  async login(email, password) {
    let res;
    try {
      res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Unable to connect to server. Make sure the backend is running.');
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Login failed');
    }

    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async register(email, password, full_name) {
    let res;
    try {
      res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name }),
      });
    } catch {
      throw new Error('Unable to connect to server. Make sure the backend is running.');
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Registration failed');
    }

    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  async getMe() {
    const res = await authFetch(`${BASE_URL}/auth/me`);
    if (!res) return null;
    if (!res.ok) return null;
    return res.json();
  },

  async refresh() {
    return refreshAccessToken();
  },

  async logout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authFetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // Server logout is best-effort
      }
    }
    clearTokens();
  },

  chatStream(message, conversationId) {
    const token = getAccessToken();
    if (!token) return null;

    const body = conversationId
      ? { message, conversation_id: conversationId }
      : { message };

    const resPromise = fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
    });

    return resPromise;
  },

  async getConversations() {
    const res = await authFetch(`${BASE_URL}/chat/conversations`);
    if (!res || !res.ok) return [];
    return res.json();
  },

  async getConversationMessages(conversationId) {
    const res = await authFetch(`${BASE_URL}/chat/${conversationId}/messages`);
    if (!res || !res.ok) return [];
    return res.json();
  },

  // ── Admin API ──

  async adminListExamples(offset = 0, limit = 50) {
    const res = await authFetch(`${BASE_URL}/admin/examples?offset=${offset}&limit=${limit}`);
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to list examples (${res.status})`);
    }
    return res.json();
  },

  async adminAddExample(body) {
    const res = await authFetch(`${BASE_URL}/admin/examples`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to add example (${res.status})`);
    }
    return res.json();
  },

  async adminUpdateExample(index, body) {
    const res = await authFetch(`${BASE_URL}/admin/examples/${index}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to update example (${res.status})`);
    }
    return res.json();
  },

  async adminDeleteExample(index) {
    const res = await authFetch(`${BASE_URL}/admin/examples/${index}`, {
      method: 'DELETE',
    });
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to delete example (${res.status})`);
    }
    return res.json();
  },

  async adminListDDL() {
    const res = await authFetch(`${BASE_URL}/admin/ddl`);
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to list DDL files (${res.status})`);
    }
    return res.json();
  },

  async adminGetDDL(tableName) {
    const res = await authFetch(`${BASE_URL}/admin/ddl/${encodeURIComponent(tableName)}`);
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to get DDL (${res.status})`);
    }
    return res.json();
  },

  async adminCreateDDL(body) {
    const res = await authFetch(`${BASE_URL}/admin/ddl`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to create DDL (${res.status})`);
    }
    return res.json();
  },

  async adminUpdateDDL(tableName, body) {
    const res = await authFetch(`${BASE_URL}/admin/ddl/${encodeURIComponent(tableName)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to update DDL (${res.status})`);
    }
    return res.json();
  },

  async adminDeleteDDL(tableName) {
    const res = await authFetch(`${BASE_URL}/admin/ddl/${encodeURIComponent(tableName)}`, {
      method: 'DELETE',
    });
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to delete DDL (${res.status})`);
    }
    return res.json();
  },

  async adminRunQuery(sql) {
    const res = await authFetch(`${BASE_URL}/admin/examples/run`, {
      method: 'POST',
      body: JSON.stringify({ sql }),
    });
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || data.error || `Query failed (${res.status})`);
    }
    return res.json();
  },

  async adminGetBusinessRules() {
    const res = await authFetch(`${BASE_URL}/admin/business-rules`);
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to load business rules (${res.status})`);
    }
    return res.json();
  },

  async adminUpdateBusinessRules(text) {
    const res = await authFetch(`${BASE_URL}/admin/business-rules`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    });
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Failed to update business rules (${res.status})`);
    }
    return res.json();
  },

  async adminTrain() {
    const res = await authFetch(`${BASE_URL}/admin/train`, {
      method: 'POST',
    });
    if (!res) throw new Error('Unable to connect to server');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Training failed (${res.status})`);
    }
    return res.json();
  },

  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,

  // ── Forecast API (public, no auth needed) ──
  // ponytail: module-level cache survives SPA route changes, clears on hard refresh
  _forecastCache: null,
  _riskCardCache: null,

  async getForecast(nDays = 14, historyDays = 90) {
    if (this._forecastCache) return this._forecastCache;
    try {
      const res = await fetch(`${BASE_URL}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n_days: nDays, history_days: historyDays }),
      });
      if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);
      const data = await res.json();
      this._forecastCache = data;
      return data;
    } catch (e) {
      console.error('Forecast fetch failed:', e);
      return null;
    }
  },

  async getForecastRiskCards(nDays = 14, historyDays = 90) {
    if (this._riskCardCache) return this._riskCardCache;
    try {
      const res = await fetch(`${BASE_URL}/forecast/risk-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n_days: nDays, history_days: historyDays }),
      });
      if (!res.ok) throw new Error(`Risk cards API error: ${res.status}`);
      const data = await res.json();
      this._riskCardCache = data;
      return data;
    } catch (e) {
      console.error('Risk cards fetch failed:', e);
      return null;
    }
  },
};
