declare module "axios" {
  export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | string;

  export interface AxiosHeaders {
    [key: string]: string | number | boolean | undefined;
  }

  export interface AxiosRequestConfig<D = unknown> {
    url?: string;
    method?: Method;
    baseURL?: string;
    timeout?: number;
    withCredentials?: boolean;
    data?: D;
    params?: unknown;
    headers?: AxiosHeaders;
    responseType?: "json" | "text" | "blob" | "arraybuffer" | "document" | "stream";
    transformResponse?: Array<(data: unknown) => unknown>;
  }

  export interface AxiosResponse<T = unknown, D = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: AxiosHeaders;
    config: AxiosRequestConfig<D>;
  }

  export interface AxiosInterceptorManager<V> {
    use(
      onFulfilled?: (value: V) => V | Promise<V>,
      onRejected?: (error: unknown) => unknown,
    ): number;
    eject(id: number): void;
  }

  export interface AxiosInstance {
    defaults: AxiosRequestConfig;
    interceptors: {
      request: AxiosInterceptorManager<AxiosRequestConfig>;
      response: AxiosInterceptorManager<AxiosResponse>;
    };
    request<T = unknown, R = T, D = unknown>(config: AxiosRequestConfig<D>): Promise<R>;
    get<T = unknown, R = T, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    post<T = unknown, R = T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  }

  export interface AxiosStatic extends AxiosInstance {
    create(config?: AxiosRequestConfig): AxiosInstance;
  }

  const axios: AxiosStatic;
  export default axios;
}
