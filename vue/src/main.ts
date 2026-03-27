import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import '@/assets/main.less'
import App from './App.vue'
import router from './router'
import { setupI18n } from './i18n'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)
app.use(setupI18n())
app.mount('#app')
