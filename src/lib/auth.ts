interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  createdAt: string;
}

const AUTH_KEY = 'boxpaper_auth';
const TOKEN_PREFIX = 'BXPP_';

const generateToken = (userId: string): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${TOKEN_PREFIX}${userId.substring(0, 8)}_${timestamp}_${randomStr}`.toUpperCase();
};

const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const createAccount = (name: string, email: string, password: string): User => {
  const userId = generateUserId();
  const token = generateToken(userId);
  
  const user: User = {
    id: userId,
    name,
    email,
    token,
    createdAt: new Date().toISOString(),
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
};

export const login = (email: string, password: string): User | null => {
  const userJson = localStorage.getItem(AUTH_KEY);
  if (!userJson) return null;
  
  try {
    const user = JSON.parse(userJson) as User;
    if (user.email === email) {
      return user;
    }
  } catch {
    return null;
  }
  
  return null;
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(AUTH_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const getAuthToken = (): string | null => {
  const user = getCurrentUser();
  return user?.token || null;
};