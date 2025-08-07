import { ref } from 'vue'
import axios from 'axios'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  const request = async (config) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await axios(config)
      return { data: response.data, success: true }
    } catch (err) {
      error.value = err.response?.data?.error || err.message
      return { data: null, success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const get = (url, config = {}) => request({ method: 'GET', url, ...config })
  const post = (url, data, config = {}) => request({ method: 'POST', url, data, ...config })
  const put = (url, data, config = {}) => request({ method: 'PUT', url, data, ...config })
  const del = (url, config = {}) => request({ method: 'DELETE', url, ...config })

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del
  }
}
