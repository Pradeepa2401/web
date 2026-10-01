import { CartItem, User } from '../types/store';

const COOKIE_USERNAME_KEY = 'folio_remembered_user';
const COOKIE_EMAIL_KEY = 'folio_remembered_email';
const COOKIE_RECENT_CATEGORY_KEY = 'folio_recent_category';
const COOKIE_RECENT_SEARCH_KEY = 'folio_recent_search';

const SESSION_USER_KEY = 'folio_active_session_user';
const SESSION_CART_KEY = 'folio_active_session_cart';
const SESSION_ID_KEY = 'JSESSIONID_SIMULATED';

export function setBrowserCookie(name: string, value: string, days = 14): void {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}; expires=${expires}; path=/; SameSite=Lax`;
  } catch {
    // Fallback if cookies are restricted in iframe
  }
}

export function getBrowserCookie(name: string): string | null {
  try {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const part of cookies) {
      const [k, ...vParts] = part.split('=');
      if (decodeURIComponent(k) === name) {
        return decodeURIComponent(vParts.join('='));
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function deleteBrowserCookie(name: string): void {
  try {
    document.cookie = `${encodeURIComponent(
      name
    )}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  } catch {
    // Ignore
  }
}

export function rememberUserCredentialsCookie(name: string, email: string): void {
  setBrowserCookie(COOKIE_USERNAME_KEY, name, 30);
  setBrowserCookie(COOKIE_EMAIL_KEY, email, 30);
}

export function clearRememberedUserCookie(): void {
  deleteBrowserCookie(COOKIE_USERNAME_KEY);
  deleteBrowserCookie(COOKIE_EMAIL_KEY);
}

export function saveRecentPreferenceCookie(category: string, search?: string): void {
  if (category && category !== 'All') {
    setBrowserCookie(COOKIE_RECENT_CATEGORY_KEY, category, 14);
  }
  if (search && search.trim().length > 1) {
    setBrowserCookie(COOKIE_RECENT_SEARCH_KEY, search.trim(), 14);
  }
}

export function getRememberedPreferences(): {
  rememberedName: string | null;
  rememberedEmail: string | null;
  recentCategory: string | null;
  recentSearch: string | null;
  rawCookieHeader: string;
} {
  return {
    rememberedName: getBrowserCookie(COOKIE_USERNAME_KEY),
    rememberedEmail: getBrowserCookie(COOKIE_EMAIL_KEY),
    recentCategory: getBrowserCookie(COOKIE_RECENT_CATEGORY_KEY),
    recentSearch: getBrowserCookie(COOKIE_RECENT_SEARCH_KEY),
    rawCookieHeader: typeof document !== 'undefined' ? document.cookie || '(none set)' : '',
  };
}

export function saveSessionUser(user: User | null): void {
  try {
    if (user) {
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      if (!sessionStorage.getItem(SESSION_ID_KEY)) {
        const sid = 'SES-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        sessionStorage.setItem(SESSION_ID_KEY, sid);
      }
    } else {
      sessionStorage.removeItem(SESSION_USER_KEY);
      localStorage.removeItem(SESSION_USER_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadSessionUser(defaultUser: User): User | null {
  try {
    const raw =
      sessionStorage.getItem(SESSION_USER_KEY) ||
      localStorage.getItem(SESSION_USER_KEY);
    if (raw) {
      return JSON.parse(raw) as User;
    }
    // Initialize with default student session on first visit so app is immediately usable
    saveSessionUser(defaultUser);
    rememberUserCredentialsCookie(defaultUser.name, defaultUser.email);
    return defaultUser;
  } catch {
    return defaultUser;
  }
}

export function saveSessionCart(cart: CartItem[]): void {
  try {
    const serialized = JSON.stringify(cart);
    sessionStorage.setItem(SESSION_CART_KEY, serialized);
    localStorage.setItem(SESSION_CART_KEY, serialized);
  } catch {
    // Ignore
  }
}

export function loadSessionCart(defaultCart: CartItem[]): CartItem[] {
  try {
    const raw =
      sessionStorage.getItem(SESSION_CART_KEY) ||
      localStorage.getItem(SESSION_CART_KEY);
    if (raw) {
      return JSON.parse(raw) as CartItem[];
    }
    saveSessionCart(defaultCart);
    return defaultCart;
  } catch {
    return defaultCart;
  }
}

export function getActiveSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = 'SES-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return 'SES-CAMPUS-2026';
  }
}
