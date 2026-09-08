<template>
  <a-breadcrumb class="breadcrumb">
    <a-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <router-link v-if="item.path && index < breadcrumbs.length - 1" :to="item.path">
        {{ item.title }}
      </router-link>
      <span v-else>{{ item.title }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const breadcrumbs = ref([])

const getBreadcrumbs = (route) => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  const first = matched[0]
  
  if (first && first.path !== '/dashboard') {
    matched.unshift({
      path: '/dashboard',
      meta: { title: '首页' }
    })
  }
  
  return matched.map(item => {
    return {
      path: item.path,
      title: item.meta.title
    }
  })
}

watch(() => route.path, (newPath) => {
  breadcrumbs.value = getBreadcrumbs(route)
}, { immediate: true })
</script>

<style scoped>
.breadcrumb {
  display: inline-block;
}
</style> 