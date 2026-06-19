declare global {
  interface Window {
    __WREN_UI_CONTEXT_PATH__?: string;
  }
}

const normalizeContextPath = (value?: string) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, '');
};

export const getContextPath = () => {
  if (typeof window !== 'undefined') {
    return normalizeContextPath(window.__WREN_UI_CONTEXT_PATH__ || '/');
  }
  return normalizeContextPath(process.env.WREN_UI_CONTEXT_PATH || '/');
};

export const appPath = (path: string) => {
  const contextPath = getContextPath();
  if (!contextPath) return path;
  if (!path || path === '/') return contextPath;
  return `${contextPath}${path.startsWith('/') ? path : `/${path}`}`;
};

export const apiPath = (path: string) => appPath(path);
