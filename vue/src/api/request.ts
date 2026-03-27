import axios from 'axios'
const request = axios.create({ timeout: 10000, withCredentials: true })
request.interceptors.response.use(r => r.data, e => Promise.reject(e))
export default request
