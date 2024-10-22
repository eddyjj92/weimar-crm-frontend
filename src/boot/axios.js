import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

let server = 'http://localhost:8000';
const host = window.location.host
if (host !== 'localhost:9000' && host !== 'localhost:9200'){
  server = `http://2.58.80.90:8000`;
}
const api = axios.create({ baseURL: server })

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response, // Retorna la respuesta si no hay errores
  error => {
    if (error.response && error.response.status === 401 && window.location.href !== `${server}/` && window.location.href !== 'http://localhost:9000/') {
      localStorage.clear()
      // Aquí puedes manejar el error 401
      alert('No autorizado. Redirigiendo al login...');
      // Ejemplo: redirigir al login
      window.location.href = '/';
    }
    return Promise.reject(error); // Lanza el error para manejarlo en los componentes
  }
)


export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api, server }
