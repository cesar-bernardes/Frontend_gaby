const AUTH_TOKEN_KEY = 'jade_auth_token';

export const getAuthToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // O cookie continua funcionando quando o armazenamento local nao estiver disponivel.
  }
};

export const clearAuthToken = () => setAuthToken(null);

export const authHeaders = (headers = {}) => {
  const token = getAuthToken();
  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
