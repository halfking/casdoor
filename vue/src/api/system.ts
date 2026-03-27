import request from './request'

export function getSystemInfo() {
  return request.get('/api/get-system-info')
}

export function getVersionInfo() {
  return request.get('/api/get-version-info')
}

export function getPrometheusInfo() {
  return request.get('/api/get-prometheus-info')
}
