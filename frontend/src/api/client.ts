import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type GetAccessToken = () => Promise<string>
type OnUnauthorized = () => void

let getAccessToken: GetAccessToken | null = null
let onUnauthorized: OnUnauthorized | null = null

/**
 * Set the function used to obtain the Auth0 access token. Call this once at app
 * init from a component that has access to useAuth0 (e.g. App.tsx).
 * Every request will then include Authorization: Bearer <token> unless skipAuth is set.
 */
export function setAccessTokenGetter(fn: GetAccessToken): void {
  getAccessToken = fn
}

/**
 * Set the callback to run when the backend returns 401 (e.g. redirect to login).
 * Call this once at app init from a component that has access to useAuth0.
 */
export function setOnUnauthorized(fn: OnUnauthorized): void {
  onUnauthorized = fn
}

/**
 * Shared axios instance for backend API calls.
 * Use this for all services that talk to the backend.
 * When setAccessTokenGetter has been called, the JWT is sent in the Authorization header.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  async (config) => {
    if ((config as ApiRequestConfig).skipAuth === true) return config
    if (!getAccessToken) return config
    try {
      const token = await getAccessToken()
      config.headers.Authorization = `Bearer ${token}`
    } catch {
      // Not authenticated; request goes without token (backend may return 401)
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized()
    }
    return Promise.reject(error)
  }
)

/**
 * Request config type for services that extend the client.
 * Set skipAuth: true to omit the Authorization header (e.g. for public endpoints).
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
}

/**
 * Helper to create a service that uses the shared client.
 * Example:
 *   const userService = createApiService('/users')
 *   userService.get('/me') -> GET {baseURL}/users/me
 */
export function createApiService(pathPrefix = '') {
  const basePath = pathPrefix ? `/${pathPrefix.replace(/^\//, '')}` : ''
  return {
    get: <T = unknown>(url: string, config?: ApiRequestConfig) =>
      apiClient.get<T>(`${basePath}${url}`, config),
    post: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
      apiClient.post<T>(`${basePath}${url}`, data, config),
    put: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
      apiClient.put<T>(`${basePath}${url}`, data, config),
    patch: <T = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
      apiClient.patch<T>(`${basePath}${url}`, data, config),
    delete: <T = unknown>(url: string, config?: ApiRequestConfig) =>
      apiClient.delete<T>(`${basePath}${url}`, config),
  }
}

export default apiClient
