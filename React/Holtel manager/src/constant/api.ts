import axios from "axios";

export const TOKEN_KEY = "hotel_token";
export const USER_KEY  = "hotel_user";
export const ROLE_KEY  = "hotel_role";

export const apiClient = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ROLE_KEY);
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(err);
  }
);

export const saveAuth = (
  token: string,
  user: { userName: string; email: string },
  roles?: string[]
) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  if (roles) {
    localStorage.setItem(ROLE_KEY, JSON.stringify(roles));
  }

  window.dispatchEvent(new Event("auth:login"));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
  window.dispatchEvent(new Event("auth:logout"));
};

export const getUser = (): { userName: string; email: string } | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const getRole = (): string[] => {
  const raw = localStorage.getItem(ROLE_KEY);
  return raw ? JSON.parse(raw) : [];
};
export const getToken  = () => localStorage.getItem(TOKEN_KEY);
export const isLoggedIn = () => !!getToken();
export const isAdmin = () => {
  const roles = getRole();
  return roles.includes("Admin") || roles.includes("Manager");
};