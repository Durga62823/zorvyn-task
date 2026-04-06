import type {
  LoginCredentials,
  RegisteredUser,
  RegisterUserDraft,
} from '../types/finance'

interface StoredUser extends RegisteredUser {
  password: string
}

interface StoredLoginToken {
  token: string
  userId: string
  issuedAt: string
}

export const REGISTERED_USERS_KEY = 'zynox-auth-registered-users'
export const LOGIN_TOKEN_KEY = 'zynox-auth-login-token'

export interface AuthSession {
  token: string
  user: RegisteredUser
}

const getStorage = () =>
  typeof window === 'undefined' ? null : window.localStorage

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const sanitizeUser = (user: StoredUser): RegisteredUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
})

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `usr-${Date.now()}-${Math.round(Math.random() * 100000)}`
}

const makeToken = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `sess-${crypto.randomUUID()}`
  }

  return `sess-${Date.now()}-${Math.round(Math.random() * 100000)}`
}

const readRegisteredUsers = (): StoredUser[] => {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  const serialized = storage.getItem(REGISTERED_USERS_KEY)

  if (!serialized) {
    return []
  }

  try {
    const parsed = JSON.parse(serialized)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (item): item is StoredUser =>
        typeof item?.id === 'string' &&
        typeof item?.name === 'string' &&
        typeof item?.email === 'string' &&
        typeof item?.password === 'string' &&
        typeof item?.createdAt === 'string' &&
        (item?.role === 'admin' || item?.role === 'viewer'),
    )
  } catch {
    return []
  }
}

const writeRegisteredUsers = (users: StoredUser[]) => {
  const storage = getStorage()

  if (!storage) {
    return
  }

  storage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
}

const readStoredLoginToken = (): StoredLoginToken | null => {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  const serialized = storage.getItem(LOGIN_TOKEN_KEY)

  if (!serialized) {
    return null
  }

  try {
    const parsed = JSON.parse(serialized)

    if (
      typeof parsed?.token !== 'string' ||
      typeof parsed?.userId !== 'string' ||
      typeof parsed?.issuedAt !== 'string'
    ) {
      return null
    }

    return parsed as StoredLoginToken
  } catch {
    return null
  }
}

const writeStoredLoginToken = (tokenRecord: StoredLoginToken) => {
  const storage = getStorage()

  if (!storage) {
    return
  }

  storage.setItem(LOGIN_TOKEN_KEY, JSON.stringify(tokenRecord))
}

export const registerUser = (draft: RegisterUserDraft): RegisteredUser => {
  const name = draft.name.trim()
  const email = normalizeEmail(draft.email)
  const password = draft.password.trim()

  if (name.length < 2) {
    throw new Error('Name must have at least 2 characters.')
  }

  if (!email.includes('@')) {
    throw new Error('Please provide a valid email address.')
  }

  if (password.length < 4) {
    throw new Error('Password must have at least 4 characters.')
  }

  const users = readRegisteredUsers()

  const existing = users.some((user) => normalizeEmail(user.email) === email)

  if (existing) {
    throw new Error('User already registered. Please login.')
  }

  const created: StoredUser = {
    id: makeId(),
    name,
    email,
    password,
    role: draft.role,
    createdAt: new Date().toISOString(),
  }

  writeRegisteredUsers([...users, created])

  return sanitizeUser(created)
}

export const loginUser = (credentials: LoginCredentials): AuthSession => {
  const email = normalizeEmail(credentials.email)
  const password = credentials.password.trim()

  const users = readRegisteredUsers()

  const matchedUser = users.find(
    (user) => normalizeEmail(user.email) === email && user.password === password,
  )

  if (!matchedUser) {
    throw new Error('Account not found in registered storage. Please register first or check credentials.')
  }

  const tokenRecord: StoredLoginToken = {
    token: makeToken(),
    userId: matchedUser.id,
    issuedAt: new Date().toISOString(),
  }

  writeStoredLoginToken(tokenRecord)

  return {
    token: tokenRecord.token,
    user: sanitizeUser(matchedUser),
  }
}

export const getActiveSession = (): AuthSession | null => {
  const tokenRecord = readStoredLoginToken()

  if (!tokenRecord) {
    return null
  }

  const users = readRegisteredUsers()
  const matchedUser = users.find((user) => user.id === tokenRecord.userId)

  if (!matchedUser) {
    clearLoginToken()
    return null
  }

  return {
    token: tokenRecord.token,
    user: sanitizeUser(matchedUser),
  }
}

export const clearLoginToken = () => {
  const storage = getStorage()

  if (!storage) {
    return
  }

  storage.removeItem(LOGIN_TOKEN_KEY)
}
