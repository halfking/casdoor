/**
 * unified-links.js — JS re-export wrapper for unified-links.ts
 * Provides all navigation utilities without TypeScript dependencies.
 */
/* eslint-disable */

const PROD_SERVICE_URLS = {
  portal: 'https://www.itestu.cn',
  memora: 'https://memora.itestu.cn',
  acc: 'https://acc.itestu.cn',
  auth: 'https://auth.itestu.cn',
  finance: 'https://finance.itestu.cn',
  docs: 'https://docs.itestu.cn',
  trendaradar: 'https://trendaradar.itestu.cn',
};

const LOCAL_SERVICE_PORTS = {
  portal: 8081,
  memora: 8001,
  acc: 4100,
  auth: 8000,
  finance: 8090,
  docs: 8200,
  trendaradar: 8081,
};

const PRODUCT_ENTRY_DEFINITIONS = [
  { id: 'memora-core', label: 'Memora', groupLabel: '', icon: '🧠', service: 'memora', external: true, ssoMode: 'query' },
  { id: 'control-center', label: '控制台', groupLabel: '', icon: '🤖', service: 'acc', external: true, ssoMode: 'hash' },
  { id: 'document-studio', label: '文档工具', groupLabel: '', icon: '📄', service: 'docs', external: true },
  { id: 'finance-ai', label: '股票推荐', groupLabel: '', icon: '💹', service: 'finance', external: true },
  { id: 'trendaradar', label: '消息雷达', groupLabel: '', icon: '📰', service: 'trendaradar', external: true },
  { id: 'auth-center', label: '账户中心', groupLabel: '', icon: '🔐', service: 'auth', external: true },
];

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function getLocationOrigin(loc) {
  if (loc.origin) return trimTrailingSlash(loc.origin);
  const protocol = loc.protocol === 'file:' ? 'http:' : loc.protocol;
  const port = loc.port ? ':' + loc.port : '';
  return protocol + '//' + loc.hostname + port;
}

function isCurrentPortalRuntime(loc) {
  return (loc.port || '') === String(LOCAL_SERVICE_PORTS.portal);
}

function getCurrentLocation(loc) {
  if (loc) return loc;
  if (typeof window === 'undefined') return undefined;
  return window.location;
}

function getLocationHref(loc) {
  if (loc.href) return loc.href;
  return getLocationOrigin(loc) + (loc.pathname || '') + (loc.search || '') + (loc.hash || '');
}

function isLocalHostname(hostname) {
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname.startsWith('192.168.')
    || hostname.startsWith('10.')
    || hostname.startsWith('172.');
}

function buildLocalServiceUrl(loc, port, path) {
  const protocol = loc.protocol === 'file:' ? 'http:' : loc.protocol;
  return protocol + '//' + loc.hostname + ':' + port + (path || '');
}

export function resolveServiceUrl(service, loc) {
  const current = getCurrentLocation(loc);
  if (current && isLocalHostname(current.hostname.toLowerCase())) {
    if (service === 'portal' && isCurrentPortalRuntime(current)) return getLocationOrigin(current);
    if (service === 'trendaradar') return buildLocalServiceUrl(current, LOCAL_SERVICE_PORTS.trendaradar) + '/trendaradar';
    return buildLocalServiceUrl(current, LOCAL_SERVICE_PORTS[service]);
  }
  return PROD_SERVICE_URLS[service];
}

export function resolvePortalLoginUrl(loc) {
  const current = getCurrentLocation(loc);
  const loginUrl = new URL(
    current && isLocalHostname(current.hostname.toLowerCase())
      ? resolveServiceUrl('portal', current) + '/login'
      : 'https://auth.itestu.cn/login'
  );

  if (current) {
    const returnTo = getLocationHref(current);
    loginUrl.searchParams.set('redirect_uri', returnTo);
    loginUrl.searchParams.set('from', returnTo);
  }

  return loginUrl.toString();
}

export function withSsoQuery(url, authToken) {
  if (!authToken) return url;
  const parsed = new URL(url);
  parsed.searchParams.set('sso', authToken);
  return parsed.toString();
}

export function withSsoHash(url, authToken) {
  if (!authToken) return url;
  const parsed = new URL(url);
  parsed.hash = 'sso=' + encodeURIComponent(authToken);
  return parsed.toString();
}

export function resolveMemoraUrl(loc) {
  return resolveServiceUrl('memora', loc);
}

export function resolveAccBaseUrl(loc) {
  return resolveServiceUrl('acc', loc) + '/';
}

export function buildAccSectionUrl(section, authToken, loc) {
  const url = new URL(resolveAccBaseUrl(loc));
  url.searchParams.set('section', section);
  if (authToken) url.hash = 'sso=' + encodeURIComponent(authToken);
  return url.toString();
}

export function resolveWorkbenchLinks(loc, authToken) {
  return {
    memora: withSsoQuery(resolveMemoraUrl(loc), authToken),
    llm: buildAccSectionUrl('llm', authToken, loc),
    settings: buildAccSectionUrl('settings', authToken, loc),
    tasks: buildAccSectionUrl('tasks', authToken, loc),
  };
}

export function getPortalNavLinks(loc) {
  const base = resolveServiceUrl('portal', loc);
  return [
    { label: '首页', href: base + '/#top' },
    { label: '结构', href: base + '/#architecture' },
    { label: '产品', href: base + '/#products' },
    { label: '路径', href: base + '/#implementation' },
    { label: 'FAQ', href: base + '/#faq' },
  ];
}

export function getPortalNavCompact(loc) {
  return [{ label: '官网', href: resolveServiceUrl('portal', loc) }];
}

function resolveProductBaseUrl(def, loc) {
  return def.service ? resolveServiceUrl(def.service, loc) : (def.url || '');
}

export function getUnifiedProductEntryGroups(loc) {
  const groups = new Map();
  for (const def of PRODUCT_ENTRY_DEFINITIONS) {
    const item = {
      id: def.id,
      label: def.label,
      href: resolveProductBaseUrl(def, loc),
      icon: def.icon,
      external: def.external !== undefined ? def.external : true,
    };
    const existing = groups.get(def.groupLabel);
    if (existing) { existing.push(item); }
    else { groups.set(def.groupLabel, [item]); }
  }
  return Array.from(groups.entries()).map(function(entry) {
    return { groupLabel: entry[0], items: entry[1] };
  });
}

export function getUnifiedProductEntries(loc) {
  return getUnifiedProductEntryGroups(loc).reduce(function(all, group) {
    return all.concat(group.items);
  }, []);
}

export function resolveProductLaunchUrl(productId, fallbackUrl, loc, authToken) {
  const def = PRODUCT_ENTRY_DEFINITIONS.find(function(item) { return item.id === productId; });
  const baseUrl = def ? resolveProductBaseUrl(def, loc) : fallbackUrl;
  if (!baseUrl) return null;
  if (def && def.ssoMode === 'query') return withSsoQuery(baseUrl, authToken);
  if (def && def.ssoMode === 'hash') return withSsoHash(baseUrl, authToken);
  return baseUrl;
}
