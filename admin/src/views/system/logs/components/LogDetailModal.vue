<template>
  <a-modal
    :open="visible"
    title="操作日志详情"
    :footer="null"
    width="800px"
    :destroy-on-close="false"
    @cancel="onClose"
  >
    <div v-if="!data" style="padding: 20px; text-align: center;">
      <a-spin tip="加载中..." />
      <p>正在加载数据...</p>
    </div>
    
    <div v-else style="padding: 10px;">
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">
        {{ JSON.stringify(data, null, 2) }}
      </pre>
    </div>
  </a-modal>
</template>

<script setup>
import { watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  data: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible']);

watch(() => props.data, (newVal) => {
  console.log('Modal data changed:', newVal);
}, { deep: true, immediate: true });

watch(() => props.visible, (newVal) => {
  console.log('Modal visibility changed:', newVal);
}, { immediate: true });

function onClose() {
  emit('update:visible', false);
}
</script> 