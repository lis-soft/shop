import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import * as Icons from '@ant-design/icons-vue'
import App from '@/App.vue'
import router from '@/router'
import 'ant-design-vue/dist/reset.css'

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
])

const app = createApp(App)

const icons = Icons
for (const i in icons) {
  app.component(i, icons[i])
}

app.component('v-chart', VChart)
app.use(createPinia())
app.use(router)
app.use(Antd)

app.mount('#app')

if (import.meta.hot) {
  import.meta.hot.accept()
} 