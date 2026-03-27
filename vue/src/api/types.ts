export interface ApiResponse<T = unknown> {
  status?: string
  msg?: string
  data?: T
  data2?: unknown
  sub?: string
  name?: string
  [key: string]: unknown
}

export interface BaseEntity {
  owner?: string
  name?: string
  displayName?: string
  createdTime?: string
  updatedTime?: string
  type?: string
  [key: string]: unknown
}

export interface User extends BaseEntity {
  id?: string
  email?: string
  phone?: string
  avatar?: string
  firstName?: string
  lastName?: string
  affiliation?: string
  isAdmin?: boolean
  isGlobalAdmin?: boolean
  groups?: string[]
  tags?: string[]
}

export interface Application extends BaseEntity {
  organization?: string
  clientId?: string
  clientSecret?: string
  redirectUris?: string[]
  grantTypes?: string[]
  tokenFormat?: string
}

export interface Organization extends BaseEntity {
  websiteUrl?: string
  favicon?: string
  defaultApplication?: string
}

export interface Provider extends BaseEntity {
  category?: string
  providerType?: string
  clientId?: string
  host?: string
}

export interface Role extends BaseEntity {
  users?: string[]
  roles?: string[]
}

export interface Permission extends BaseEntity {
  users?: string[]
  roles?: string[]
  resources?: string[]
  actions?: string[]
}

export interface Model extends BaseEntity {
  modelText?: string
}

export interface Group extends BaseEntity {
  parentId?: string
  children?: Group[]
  users?: string[]
}

export interface Cert extends BaseEntity {
  certificate?: string
  privateKey?: string
  domain?: string
}

export interface Enforcer extends BaseEntity {
  model?: string
  adapter?: string
  enabled?: boolean
}

export interface Token extends BaseEntity {
  application?: string
  user?: string
  accessToken?: string
  expiresIn?: number
}

export interface Session extends BaseEntity {
  sessionId?: string
  application?: string
  user?: string
}

export interface Record extends BaseEntity {
  user?: string
  application?: string
  method?: string
}

export interface Resource extends BaseEntity {
  user?: string
  parent?: string
  fileName?: string
  provider?: string
  tag?: string
}

export interface Site extends BaseEntity {
  host?: string
  domain?: string
}

export interface Rule extends BaseEntity {
  ruleType?: string
  expression?: string
}

export interface Ticket extends BaseEntity {
  submitter?: string
  receiver?: string
  state?: string
  messages?: Array<{ [key: string]: unknown }>
}

export interface Webhook extends BaseEntity {
  organization?: string
  url?: string
  method?: string
}

export interface Product extends BaseEntity {
  currency?: string
  price?: number
  quantity?: number
}

export interface Pricing extends BaseEntity {
  product?: string
  currency?: string
  price?: number
}

export interface Plan extends BaseEntity {
  product?: string
  pricing?: string
  paymentProvider?: string
}

export interface Order extends BaseEntity {
  user?: string
  product?: string
  payment?: string
  state?: string
}

export interface Payment extends BaseEntity {
  provider?: string
  order?: string
  currency?: string
  amount?: number
}

export interface Subscription extends BaseEntity {
  user?: string
  plan?: string
  state?: string
}

export interface Transaction extends BaseEntity {
  order?: string
  provider?: string
  amount?: number
  currency?: string
}

export interface Verification extends BaseEntity {
  organization?: string
  user?: string
  statusText?: string
}

export interface Syncer extends BaseEntity {
  organization?: string
  databaseType?: string
  host?: string
}

export interface Adapter extends BaseEntity {
  databaseType?: string
  host?: string
  database?: string
}

export interface Form extends BaseEntity {
  organization?: string
  formText?: string
}

export interface Invitation extends BaseEntity {
  application?: string
  code?: string
  expireInHours?: number
}

export interface MfaType extends BaseEntity {
  category?: string
  provider?: string
}

export interface Dashboard extends BaseEntity {
  users?: number
  applications?: number
  organizations?: number
}

export interface OAuthParams {
  clientId?: string
  responseType?: string
  redirectUri?: string
  type?: string
  scope?: string
  state?: string
  nonce?: string
  challengeMethod?: string
  codeChallenge?: string
  userCode?: string
  id?: string
  service?: string
}

export interface LoginBody {
  username?: string
  password?: string
  application?: string
  organization?: string
  [key: string]: unknown
}
