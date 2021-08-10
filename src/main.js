import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

import './assets/css/global.css'
import '@/assets/fonts/iconfont.css'

Vue.config.productionTip = false

axios.interceptors.request.use(config => {

  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/'
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
Vue.prototype.$http = axios

Vue.component('tree-table', TreeTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
