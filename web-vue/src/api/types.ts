// ============================================================
// Casdoor API type definitions — derived from Go backend structs
// ============================================================

// ---------- Common helper types ----------
export interface ThemeData {
  themeType: string;
  colorPrimary: string;
  borderRadius: number;
  isCompact: boolean;
  isEnabled?: boolean;
}

// ---------- User ----------
export interface Address {
  tag: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zipCode: string;
  region: string;
}

export interface FaceId {
  name: string;
  faceIdData: number[];
  ImageUrl: string;
}

export interface MfaProps {
  enabled: boolean;
  isPreferred: boolean;
  mfaType: string;
  secret?: string;
  countryCode?: string;
  url?: string;
  recoveryCodes?: string[];
  mfaRememberInHours: number;
}

export interface ProductInfo {
  owner: string;
  name: string;
  createdTime?: string;
  displayName: string;
  image?: string;
  detail?: string;
  price: number;
  currency?: string;
  isRecharge?: boolean;
  quantity?: number;
  pricingName?: string;
  planName?: string;
}

export interface User {
  owner: string;
  name: string;
  createdTime: string;
  updatedTime: string;
  deletedTime: string;
  id: string;
  externalId: string;
  type: string;
  password: string;
  passwordSalt: string;
  passwordType: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatar: string;
  avatarType: string;
  permanentAvatar: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  countryCode: string;
  region: string;
  location: string;
  address: string[];
  addresses: Address[];
  affiliation: string;
  title: string;
  idCardType: string;
  idCard: string;
  realName: string;
  isVerified: boolean;
  homepage: string;
  bio: string;
  tag: string;
  language: string;
  gender: string;
  birthday: string;
  education: string;
  score: number;
  karma: number;
  ranking: number;
  balance: number;
  balanceCredit: number;
  currency: string;
  balanceCurrency: string;
  isDefaultAvatar: boolean;
  isOnline: boolean;
  isAdmin: boolean;
  isForbidden: boolean;
  isDeleted: boolean;
  signupApplication: string;
  hash: string;
  preHash: string;
  registerType: string;
  registerSource: string;
  accessKey: string;
  accessSecret: string;
  accessToken: string;
  originalToken: string;
  originalRefreshToken: string;
  createdIp: string;
  lastSigninTime: string;
  lastSigninIp: string;
  // Social login fields (all string)
  github: string;
  google: string;
  qq: string;
  wechat: string;
  facebook: string;
  dingtalk: string;
  weibo: string;
  gitee: string;
  linkedin: string;
  wecom: string;
  lark: string;
  gitlab: string;
  adfs: string;
  baidu: string;
  alipay: string;
  casdoor: string;
  infoflow: string;
  apple: string;
  azuread: string;
  azureadb2c: string;
  slack: string;
  steam: string;
  bilibili: string;
  okta: string;
  douyin: string;
  kwai: string;
  line: string;
  amazon: string;
  auth0: string;
  battlenet: string;
  bitbucket: string;
  box: string;
  cloudfoundry: string;
  dailymotion: string;
  deezer: string;
  digitalocean: string;
  discord: string;
  dropbox: string;
  eveonline: string;
  fitbit: string;
  gitea: string;
  heroku: string;
  influxcloud: string;
  instagram: string;
  intercom: string;
  kakao: string;
  lastfm: string;
  mailru: string;
  meetup: string;
  microsoftonline: string;
  naver: string;
  nextcloud: string;
  onedrive: string;
  oura: string;
  patreon: string;
  paypal: string;
  salesforce: string;
  shopify: string;
  soundcloud: string;
  spotify: string;
  strava: string;
  stripe: string;
  telegram: string;
  tiktok: string;
  tumblr: string;
  twitch: string;
  twitter: string;
  typetalk: string;
  uber: string;
  vk: string;
  wepay: string;
  xero: string;
  yahoo: string;
  yammer: string;
  yandex: string;
  zoom: string;
  metamask: string;
  web3onboard: string;
  custom: string;
  custom2: string;
  custom3: string;
  custom4: string;
  custom5: string;
  custom6: string;
  custom7: string;
  custom8: string;
  custom9: string;
  custom10: string;
  // MFA & security
  preferredMfaType: string;
  recoveryCodes: string[];
  totpSecret: string;
  mfaPhoneEnabled: boolean;
  mfaEmailEnabled: boolean;
  mfaRadiusEnabled: boolean;
  mfaRadiusUsername: string;
  mfaRadiusProvider: string;
  mfaPushEnabled: boolean;
  mfaPushReceiver: string;
  mfaPushProvider: string;
  multiFactorAuths?: MfaProps[];
  invitation: string;
  invitationCode: string;
  faceIds: FaceId[];
  cart: ProductInfo[];
  ldap: string;
  properties: Record<string, string>;
  // index
  [key: string]: unknown;
}

// ---------- Organization ----------
export interface AccountItem {
  name: string;
  visible: boolean;
  viewRule: string;
  modifyRule: string;
  regex: string;
  tab: string;
}

export interface MfaItem {
  name: string;
  rule: string;
}

export interface Organization {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  websiteUrl: string;
  logo: string;
  logoDark: string;
  favicon: string;
  hasPrivilegeConsent: boolean;
  passwordType: string;
  passwordSalt: string;
  passwordOptions: string[];
  passwordObfuscatorType: string;
  passwordObfuscatorKey: string;
  passwordExpireDays: number;
  countryCodes: string[];
  defaultAvatar: string;
  defaultApplication: string;
  userTypes: string[];
  tags: string[];
  languages: string[];
  themeData: ThemeData | null;
  masterPassword: string;
  defaultPassword: string;
  masterVerificationCode: string;
  ipWhitelist: string;
  initScore: number;
  enableSoftDeletion: boolean;
  isProfilePublic: boolean;
  useEmailAsUsername: boolean;
  enableTour: boolean;
  disableSignin: boolean;
  ipRestriction: string;
  navItems: string[];
  userNavItems: string[];
  widgetItems: string[];
  mfaItems: MfaItem[];
  mfaRememberInHours: number;
  accountMenu: string;
  accountItems: AccountItem[];
  dcrPolicy: string;
  ldapAttributes: string[];
  kerberosRealm: string;
  kerberosKdcHost: string;
  kerberosKeytab: string;
  kerberosServiceName: string;
  orgBalance: number;
  userBalance: number;
  balanceCredit: number;
  balanceCurrency: string;
}

// ---------- Application ----------
export interface SigninMethod {
  name: string;
  displayName: string;
  rule: string;
}

export interface SignupItem {
  name: string;
  visible: boolean;
  required: boolean;
  prompted: boolean;
  type: string;
  customCss: string;
  label: string;
  placeholder: string;
  options: string[];
  regex: string;
  rule: string;
}

export interface SigninItem {
  name: string;
  visible: boolean;
  label: string;
  customCss: string;
  placeholder: string;
  rule: string;
  isCustom: boolean;
}

export interface SamlItem {
  name: string;
  nameFormat: string;
  value: string;
}

export interface JwtItem {
  name: string;
  category: string;
  value: string;
  type: string;
}

export interface ScopeItem {
  name: string;
  displayName: string;
  description: string;
  tools: string[];
}

export interface ScopeDescription {
  scope: string;
  displayName: string;
  description: string;
}

export interface ProviderItem {
  owner: string;
  name: string;
  canSignUp: boolean;
  canSignIn: boolean;
  canUnlink: boolean;
  bindingRule: string[] | null;
  countryCodes: string[];
  prompted: boolean;
  signupGroup: string;
  rule: string;
  provider: Provider | null;
}

export interface Application {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  category: string;
  type: string;
  scopes: ScopeItem[];
  logo: string;
  title: string;
  favicon: string;
  order: number;
  homepageUrl: string;
  description: string;
  organization: string;
  cert: string;
  defaultGroup: string;
  headerHtml: string;
  enablePassword: boolean;
  enableSignUp: boolean;
  disableSignin: boolean;
  enableSigninSession: boolean;
  enableAutoSignin: boolean;
  enableCodeSignin: boolean;
  enableExclusiveSignin: boolean;
  enableSamlCompress: boolean;
  enableSamlC14n10: boolean;
  enableSamlPostBinding: boolean;
  disableSamlAttributes: boolean;
  enableSamlAssertionSignature: boolean;
  useEmailAsSamlNameId: boolean;
  enableWebAuthn: boolean;
  enableLinkWithEmail: boolean;
  orgChoiceMode: string;
  samlReplyUrl: string;
  providers: ProviderItem[];
  signinMethods: SigninMethod[];
  signupItems: SignupItem[];
  signinItems: SigninItem[];
  grantTypes: string[];
  organizationObj: Organization | null;
  certPublicKey: string;
  tags: string[];
  samlAttributes: SamlItem[];
  samlHashAlgorithm: string;
  isShared: boolean;
  ipRestriction: string;
  clientId: string;
  clientSecret: string;
  clientCert: string;
  redirectUris: string[];
  forcedRedirectOrigin: string;
  tokenFormat: string;
  tokenSigningMethod: string;
  tokenFields: string[];
  tokenAttributes: JwtItem[];
  expireInHours: number;
  refreshExpireInHours: number;
  cookieExpireInHours: number;
  signupUrl: string;
  signinUrl: string;
  forgetUrl: string;
  affiliationUrl: string;
  ipWhitelist: string;
  termsOfUse: string;
  signupHtml: string;
  signinHtml: string;
  themeData: ThemeData | null;
  footerHtml: string;
  formCss: string;
  formCssMobile: string;
  formOffset: number;
  formSideHtml: string;
  formBackgroundUrl: string;
  formBackgroundUrlMobile: string;
  failedSigninLimit: number;
  failedSigninFrozenTime: number;
  codeResendTimeout: number;
  customScopes: ScopeDescription[];
  domain: string;
  otherDomains: string[];
  upstreamHost: string;
  sslMode: string;
  sslCert: string;
}

// ---------- Provider ----------
export interface Provider {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  category: string;
  type: string;
  subType: string;
  method: string;
  clientId: string;
  clientSecret: string;
  clientId2: string;
  clientSecret2: string;
  cert: string;
  customAuthUrl: string;
  customTokenUrl: string;
  customUserInfoUrl: string;
  customLogo: string;
  scopes: string;
  userMapping: Record<string, string>;
  httpHeaders: Record<string, string>;
  host: string;
  port: number;
  disableSsl: boolean;
  sslMode: string;
  title: string;
  content: string;
  receiver: string;
  regionId: string;
  signName: string;
  templateCode: string;
  appId: string;
  endpoint: string;
  intranetEndpoint: string;
  domain: string;
  bucket: string;
  pathPrefix: string;
  metadata: string;
  idP: string;
  issuerUrl: string;
  enableSignAuthnRequest: boolean;
  emailRegex: string;
  providerUrl: string;
  enableProxy: boolean;
  enablePkce: boolean;
}

// ---------- Role ----------
export interface Role {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  description: string;
  users: string[];
  groups: string[];
  roles: string[];
  domains: string[];
  isEnabled: boolean;
}

// ---------- Permission ----------
export interface Permission {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  description: string;
  users: string[];
  groups: string[];
  roles: string[];
  domains: string[];
  model: string;
  adapter: string;
  resourceType: string;
  resources: string[];
  actions: string[];
  effect: string;
  isEnabled: boolean;
  submitter: string;
  approver: string;
  approveTime: string;
  state: string;
}

// ---------- Token ----------
export interface Token {
  owner: string;
  name: string;
  createdTime: string;
  application: string;
  organization: string;
  user: string;
  code: string;
  accessToken: string;
  refreshToken: string;
  accessTokenHash: string;
  refreshTokenHash: string;
  expiresIn: number;
  scope: string;
  tokenType: string;
  codeChallenge: string;
  codeIsUsed: boolean;
  codeExpireIn: number;
  resource: string;
}

export interface TokenWrapper {
  access_token: string;
  id_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface IntrospectionResponse {
  active: boolean;
  scope?: string;
  client_id?: string;
  username?: string;
  token_type?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  sub?: string;
  aud?: string[];
  iss?: string;
  jti?: string;
}

// ---------- Session ----------
export interface Session {
  owner: string;
  name: string;
  application: string;
  createdTime: string;
  sessionId: string[];
}

// ---------- Record ----------
export interface AuditRecord {
  id: number;
  owner: string;
  name: string;
  createdTime: string;
  organization: string;
  clientIp: string;
  user: string;
  method: string;
  requestUri: string;
  action: string;
  language: string;
  object: string;
  response: string;
  statusCode: number;
  isTriggered: boolean;
}

// ---------- Group ----------
export interface Group {
  owner: string;
  name: string;
  createdTime: string;
  updatedTime: string;
  displayName: string;
  manager: string;
  contactEmail: string;
  type: string;
  parentId: string;
  parentName: string;
  isTopGroup: boolean;
  users: string[];
  title?: string;
  key?: string;
  haveChildren: boolean;
  children?: Group[];
  isEnabled: boolean;
}

// ---------- Model ----------
export interface CasbinModel {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  description: string;
  modelText: string;
}

// ---------- Adapter ----------
export interface Adapter {
  owner: string;
  name: string;
  createdTime: string;
  table: string;
  useSameDb: boolean;
  type: string;
  databaseType: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// ---------- Enforcer ----------
export interface Enforcer {
  owner: string;
  name: string;
  createdTime: string;
  updatedTime: string;
  displayName: string;
  description: string;
  model: string;
  adapter: string;
  modelCfg: Record<string, string>;
}

// ---------- Payment ----------
export interface Payment {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  provider: string;
  type: string;
  products: string[];
  productsDisplayName: string;
  productName: string;
  productDisplayName: string;
  detail: string;
  currency: string;
  price: number;
  user: string;
  personName: string;
  personIdCard: string;
  personEmail: string;
  personPhone: string;
  invoiceType: string;
  invoiceTitle: string;
  invoiceTaxId: string;
  invoiceRemark: string;
  invoiceUrl: string;
  order: string;
  orderObj?: Order;
  outOrderId: string;
  payUrl: string;
  successUrl: string;
  state: string;
  message: string;
}

// ---------- Plan ----------
export interface Plan {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  period: string;
  product: string;
  paymentProviders: string[];
  isEnabled: boolean;
  isExclusive: boolean;
  role: string;
  options: string[];
}

// ---------- Pricing ----------
export interface Pricing {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  description: string;
  plans: string[];
  isEnabled: boolean;
  trialDuration: number;
  application: string;
}

// ---------- Product ----------
export interface Product {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  image: string;
  detail: string;
  description: string;
  tag: string;
  currency: string;
  price: number;
  quantity: number;
  sold: number;
  isRecharge: boolean;
  rechargeOptions: number[];
  disableCustomRecharge: boolean;
  providers: string[];
  successUrl: string;
  state: string;
  providerObjs: Provider[];
}

// ---------- Subscription ----------
export interface Subscription {
  owner: string;
  name: string;
  displayName: string;
  createdTime: string;
  description: string;
  user: string;
  pricing: string;
  plan: string;
  payment: string;
  startTime: string;
  endTime: string;
  period: string;
  state: string;
}

// ---------- Cert ----------
export interface Cert {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  scope: string;
  type: string;
  cryptoAlgorithm: string;
  bitSize: number;
  expireInYears: number;
  expireTime: string;
  domainExpireTime: string;
  provider: string;
  account: string;
  accessKey: string;
  accessSecret: string;
  certificate: string;
  privateKey: string;
}

// ---------- Resource ----------
export interface Resource {
  owner: string;
  name: string;
  createdTime: string;
  user: string;
  provider: string;
  application: string;
  tag: string;
  parent: string;
  fileName: string;
  fileType: string;
  fileFormat: string;
  fileSize: number;
  url: string;
  description: string;
}

// ---------- Webhook ----------
export interface WebhookHeader {
  name: string;
  value: string;
}

export interface Webhook {
  owner: string;
  name: string;
  createdTime: string;
  organization: string;
  url: string;
  method: string;
  contentType: string;
  headers: WebhookHeader[];
  events: string[];
  tokenFields: string[];
  objectFields: string[];
  isUserExtended: boolean;
  singleOrgOnly: boolean;
  isEnabled: boolean;
}

// ---------- Syncer ----------
export interface TableColumn {
  name: string;
  type: string;
  casdoorName: string;
  isKey: boolean;
  isHashed: boolean;
  values: string[];
}

export interface Syncer {
  owner: string;
  name: string;
  createdTime: string;
  organization: string;
  type: string;
  databaseType: string;
  sslMode: string;
  sshType: string;
  host: string;
  port: number;
  user: string;
  password: string;
  sshHost: string;
  sshPort: number;
  sshUser: string;
  sshPassword: string;
  cert: string;
  database: string;
  table: string;
  tableColumns: TableColumn[];
  affiliationTable: string;
  avatarBaseUrl: string;
  errorText: string;
  syncInterval: number;
  isReadOnly: boolean;
  isEnabled: boolean;
}

// ---------- Invitation ----------
export interface Invitation {
  owner: string;
  name: string;
  createdTime: string;
  updatedTime: string;
  displayName: string;
  code: string;
  isRegexp: boolean;
  quota: number;
  usedCount: number;
  application: string;
  username: string;
  email: string;
  phone: string;
  signupGroup: string;
  defaultCode: string;
  state: string;
}

// ---------- Order ----------
export interface Order {
  owner: string;
  name: string;
  createdTime: string;
  updateTime: string;
  displayName: string;
  products: string[];
  productInfos: ProductInfo[];
  user: string;
  payment: string;
  price: number;
  currency: string;
  state: string;
  message: string;
}

// ---------- Transaction ----------
export interface Transaction {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  application: string;
  domain: string;
  category: string;
  type: string;
  subtype: string;
  provider: string;
  user: string;
  tag: string;
  amount: number;
  currency: string;
  payment: string;
  state: string;
}

// ---------- Form ----------
export interface FormItem {
  name: string;
  label: string;
  visible: boolean;
  width: string;
}

export interface Form {
  owner: string;
  name: string;
  createdTime: string;
  displayName: string;
  type: string;
  tag: string;
  formItems: FormItem[];
}

// ---------- Site ----------
export interface NodeItem {
  name: string;
  version: string;
  diff: string;
  pid: number;
  status: string;
  message: string;
  provider: string;
}

export interface Site {
  owner: string;
  name: string;
  createdTime: string;
  updatedTime: string;
  displayName: string;
  tag: string;
  domain: string;
  otherDomains: string[];
  needRedirect: boolean;
  disableVerbose: boolean;
  rules: string[];
  enableAlert: boolean;
  alertInterval: number;
  alertTryTimes: number;
  alertProviders: string[];
  challenges: string[];
  host: string;
  port: number;
  hosts: string[];
  sslMode: string;
  sslCert: string;
  publicIp: string;
  node: string;
  isSelf: boolean;
  status: string;
  nodes: NodeItem[];
  casdoorApplication: string;
  applicationObj: Application | null;
}

// ---------- Rule ----------
export interface Expression {
  name: string;
  operator: string;
  value: string;
}

export interface Rule {
  owner: string;
  name: string;
  createdTime: string;
  updatedTime: string;
  type: string;
  expressions: Expression[];
  action: string;
  statusCode: number;
  reason: string;
  isVerbose: boolean;
}

// ---------- Ticket ----------
export interface TicketMessage {
  author: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface Ticket {
  owner: string;
  name: string;
  createdTime: string;
  updatedTime: string;
  displayName: string;
  user: string;
  title: string;
  content: string;
  state: string;
  messages: TicketMessage[];
}

// ---------- LDAP ----------
export interface Ldap {
  id: string;
  owner: string;
  createdTime: string;
  serverName: string;
  host: string;
  port: number;
  enableSsl: boolean;
  allowSelfSignedCert: boolean;
  username: string;
  password: string;
  baseDn: string;
  filter: string;
  filterFields: string[];
  defaultGroup: string;
  passwordType: string;
  customAttributes: Record<string, string>;
  autoSync: number;
  lastSync: string;
  enableGroups: boolean;
}

// ---------- Dashboard ----------
export interface DashboardMapItem {
  [key: string]: number[];
}

// ---------- Consent ----------
export interface ConsentForm {
  scope: string;
  accepted: boolean;
}

// ---------- Re-export ApiResponse from request ----------
export type { ApiResponse, PaginatedResponse } from "./request";
