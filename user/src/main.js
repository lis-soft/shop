import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initMobileViewport } from './utils/mobileViewport'
import ProfileOverviewHeader from './components/common/ProfileOverviewHeader.vue'

initMobileViewport()

const app = createApp(App)

app.component('ProfileOverviewHeader', ProfileOverviewHeader)
app.use(router)
app.mount('#app')

window.setTimeout(() => {
  import('./utils/customerSupport').then(({ initCustomerSupport }) => {
    initCustomerSupport()
  }).catch(() => {})
}, 800)
