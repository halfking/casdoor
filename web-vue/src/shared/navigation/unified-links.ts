type LocationLike = Pick<Location, 'hostname' | 'protocol'> & Partial<Pick<Location, 'port' | 'origin' | 'href' | 'pathname' | 'search' | 'hash'>>;

export interface NavLink {
  id?: string;
  label: string;
  href: string;
  external?: boolean;
  highlight?: boolean;
  icon?: string;
}

export interface ProductEntryGroup {
  groupLabel: string;
  items: NavLink[];
}

interface ProductEntryDefinition {
  id: string;
  label: string;
  groupLabel: string;
  icon: string;
  external?: boolean;
  service?: ServiceKey;
  url?: string;
  ssoMode?: 'query' | 'hash';
}

type ServiceKey = 'portal' | 'memora' | 'acc' | 'auth' | 'finance' | 'docs' | 'trendaradar' | 'orchest';

const PROD_SERVICE_URLS: Record<ServiceKey, string> = {
  portal: 'https://www.itestu.cn',
  memora: 'https://m.itestu.cn',
  acc: 'https://acc.itestu.cn',
  auth: 'https://auth.itestu.cn',
  finance: 'https://finance.itestu.cn',
  docs: 'https://docs.itestu.cn',
  trendaradar: 'https://trendaradar.itestu.cn',
  orchest: 'https://orchest.itestu.cn',
};

const LOCAL_SERVICE_PORTS = {
  portal: 8081,
  memora: 8001,
  acc: 4100,
  auth: 8000,
  finance: 8090,
  docs: 8200,
  trendaradar: 8081,
  orchest: 8300,
} as const;

const PRODUCT_ENTRY_DEFINITIONS: ProductEntryDefinition[] = [
  { id: 'memora-core', label: 'Memora 记忆中枢', groupLabel: '基础服务', icon: '🧠', service: 'memora', external: true, ssoMode: 'query' },
  { id: 'control-center', label: 'Agent 控制中心', groupLabel: '基础服务', icon: '🤖', service: 'acc', external: true, ssoMode: 'hash' },
  { id: 'auth-center', label: '统一认证中心', groupLabel: '基础服务', icon: '🔐', service: 'auth', external: true },
  { id: 'document-studio', label: '文档转换工坊', groupLabel: '基础服务', icon: '📄', service: 'docs', external: true },
  { id: 'finance-ai', label: '股票分析推荐系统', groupLabel: '业务应用', icon: '📈', service: 'finance', external: true },
  { id: 'trendaradar', label: '消息雷达', groupLabel: '业务应用', icon: '📡', service: 'trendaradar', external: true },
  { id: 'orchest', label: '智能代理编排中心', groupLabel: '业务应用', icon: '🕸️', service: 'orchest', external: true },
];

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

function getLocationOrigin(locationLike: LocationLike): string {
  if (locationLike.origin) {
    return trimTrailingSlash(locationLike.origin);
  }

  const protocol = locationLike.protocol === 'file:' ? 'http:' : locationLike.protocol;
  const port = locationLike.port ? `:${locationLike.port}` : '';
  return `${protocol}//${locationLike.hostname}${port}`;
}

function getCurrentLocation(locationLike?: LocationLike): LocationLike | undefined {
  if (locationLike) {
    return locationLike;
  }

  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.location;
}

function getLocationHref(locationLike: LocationLike): string {
  if (locationLike.href) {
    return locationLike.href;
  }

  return `${getLocationOrigin(locationLike)}${locationLike.pathname ?? ''}${locationLike.search ?? ''}${locationLike.hash ?? ''}`;
}

export function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname.startsWith('192.168.')
    || hostname.startsWith('10.')
    || hostname.startsWith('172.');
}

function buildLocalServiceUrl(locationLike: LocationLike, port: number, path = ''): string {
  const protocol = locationLike.protocol === 'file:' ? 'http:' : locationLike.protocol;
  return `${protocol}//${locationLike.hostname}:${port}${path}`;
}

export function resolveServiceUrl(service: ServiceKey, locationLike?: LocationLike): string {
  const currentLocation = getCurrentLocation(locationLike);
  if (currentLocation && isLocalHostname(currentLocation.hostname.toLowerCase())) {
    if (service === 'portal') {
      return getLocationOrigin(currentLocation);
    }

    if (service === 'trendaradar') {
      return `${buildLocalServiceUrl(currentLocation, LOCAL_SERVICE_PORTS.trendaradar)}/trendaradar`;
    }

    return buildLocalServiceUrl(currentLocation, LOCAL_SERVICE_PORTS[service]);
  }

  return PROD_SERVICE_URLS[service];
}

export function resolvePortalLoginUrl(locationLike?: LocationLike): string {
  const currentLocation = getCurrentLocation(locationLike);
  const loginUrl = new URL(
    currentLocation && isLocalHostname(currentLocation.hostname.toLowerCase())
      ? `${resolveServiceUrl('portal', currentLocation)}/login`
      : 'https://auth.itestu.cn/login',
  );

  if (currentLocation) {
    const returnTo = getLocationHref(currentLocation);
    loginUrl.searchParams.set('redirect_uri', returnTo);
    loginUrl.searchParams.set('from', returnTo);
  }

  return loginUrl.toString();
}

export function withSsoQuery(url: string, authToken?: string | null): string {
  if (!authToken) {
    return url;
  }

  const parsed = new URL(url);
  parsed.searchParams.set('sso', authToken);
  return parsed.toString();
}

export function withSsoHash(url: string, authToken?: string | null): string {
  if (!authToken) {
    return url;
  }

  const parsed = new URL(url);
  parsed.hash = `sso=${encodeURIComponent(authToken)}`;
  return parsed.toString();
}

export function resolveMemoraUrl(locationLike?: LocationLike): string {
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_MEMORA_BASE_URL?.trim() : '';
  if (envUrl) {
    return trimTrailingSlash(envUrl);
  }

  return resolveServiceUrl('memora', locationLike);
}

export function resolveAccBaseUrl(locationLike?: LocationLike): string {
  return `${resolveServiceUrl('acc', locationLike)}/`;
}

export function buildAccSectionUrl(section: string, authToken?: string | null, locationLike?: LocationLike): string {
  const url = new URL(resolveAccBaseUrl(locationLike));
  url.searchParams.set('section', section);

  if (authToken) {
    url.hash = `sso=${encodeURIComponent(authToken)}`;
  }

  return url.toString();
}

export function resolveWorkbenchLinks(locationLike?: LocationLike, authToken?: string | null) {
  return {
    memora: withSsoQuery(resolveMemoraUrl(locationLike), authToken),
    llm: buildAccSectionUrl('llm', authToken, locationLike),
    settings: buildAccSectionUrl('settings', authToken, locationLike),
    tasks: buildAccSectionUrl('tasks', authToken, locationLike),
  };
}

export function getPortalNavLinks(locationLike?: LocationLike): NavLink[] {
  const base = resolveServiceUrl('portal', locationLike);
  return [
    { label: '首页', href: `${base}/#top` },
    { label: '结构', href: `${base}/#architecture` },
    { label: '产品', href: `${base}/#products` },
    { label: '路径', href: `${base}/#implementation` },
    { label: 'FAQ', href: `${base}/#faq` },
  ];
}

export function getPortalNavCompact(locationLike?: LocationLike): NavLink[] {
  return [{ label: '官网', href: resolveServiceUrl('portal', locationLike) }];
}

function resolveProductBaseUrl(definition: ProductEntryDefinition, locationLike?: LocationLike): string {
  if (definition.service) {
    return resolveServiceUrl(definition.service, locationLike);
  }

  return definition.url || '';
}

export function getUnifiedProductEntryGroups(locationLike?: LocationLike): ProductEntryGroup[] {
  const groups = new Map<string, NavLink[]>();

  for (const definition of PRODUCT_ENTRY_DEFINITIONS) {
    const item: NavLink = {
      id: definition.id,
      label: definition.label,
      href: resolveProductBaseUrl(definition, locationLike),
      icon: definition.icon,
      external: definition.external ?? true,
    };

    const groupItems = groups.get(definition.groupLabel);
    if (groupItems) {
      groupItems.push(item);
      continue;
    }

    groups.set(definition.groupLabel, [item]);
  }

  return Array.from(groups.entries()).map(([groupLabel, items]) => ({ groupLabel, items }));
}

export function getUnifiedProductEntries(locationLike?: LocationLike): NavLink[] {
  return getUnifiedProductEntryGroups(locationLike).flatMap((group) => group.items);
}

export function resolveProductLaunchUrl(
  productId: string,
  fallbackUrl?: string,
  locationLike?: LocationLike,
  authToken?: string | null,
): string | null {
  const definition = PRODUCT_ENTRY_DEFINITIONS.find((item) => item.id === productId);
  const baseUrl = definition ? resolveProductBaseUrl(definition, locationLike) : fallbackUrl;

  if (!baseUrl) {
    return null;
  }

  if (definition?.ssoMode === 'query') {
    return withSsoQuery(baseUrl, authToken);
  }

  if (definition?.ssoMode === 'hash') {
    return withSsoHash(baseUrl, authToken);
  }

  return baseUrl;
}