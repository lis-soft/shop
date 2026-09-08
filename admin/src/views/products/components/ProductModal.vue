<template>
  <a-modal
    :title="title"
    :open="visible"
    :confirmLoading="loading"
    @cancel="handleCancel"
    @ok="handleSubmit"
    okText="确定"
    cancelText="取消"
    width="600px"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item name="product_title" label="商品名称">
        <a-input
          v-model:value="formState.product_title"
          placeholder="请输入商品名称"
          allow-clear
        />
      </a-form-item>

      <a-form-item name="product_info" label="商品信息">
        <a-textarea
          v-model:value="formState.product_info"
          placeholder="请输入商品信息"
          :rows="3"
          allow-clear
        />
      </a-form-item>

      <a-form-item name="product_link" label="商品链接">
        <a-input
          v-model:value="formState.product_link"
          placeholder="请输入商品链接"
          allow-clear
        />
      </a-form-item>

      <a-form-item name="product_pic" label="商品图片">
        <div class="upload-wrapper">
          <a-upload
            v-model:file-list="fileList"
            name="file"
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            :customRequest="handleUpload"
            :maxCount="1"
            :disabled="uploadLoading"
            accept="image/*"
          >
            <div v-if="!formState.product_pic">
              <loading-outlined v-if="uploadLoading" spin />
              <plus-outlined v-else />
              <div style="margin-top: 8px">{{ uploadLoading ? '上传中...' : '上传' }}</div>
            </div>
            <template v-else>
              <div class="preview-image">
                <img :src="previewImageUrl" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            </template>
          </a-upload>
        </div>
        <a-input
          v-model:value="formState.product_pic"
          placeholder="图片URL"
          allow-clear
          class="pic-input"
          v-show="false"
        />
      </a-form-item>

      <a-form-item name="price" label="商品价格">
        <a-input-number
          v-model:value="formState.price"
          style="width: 100%"
          :min="0"
          :precision="2"
          placeholder="请输入商品价格"
        />
      </a-form-item>

      <a-form-item name="commission" label="商品利润率">
        <a-input-number
          v-model:value="formState.commission"
          style="width: 100%"
          :min="0"
          :max="100"
          :precision="2"
          placeholder="请输入商品利润率"
          addon-after="%"
        />
      </a-form-item>

      <a-form-item name="status" label="商品状态">
        <a-radio-group v-model:value="formState.status">
          <a-radio :value="1">上架</a-radio>
          <a-radio :value="0">下架</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed, ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { uploadImage } from '@/api/upload'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '新增商品' },
  editData: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref()
const fileList = ref([])
const uploadLoading = ref(false)

const formState = reactive({
  id: null,
  product_title: '',
  product_info: '',
  product_link: '',
  product_pic: '',
  price: 0,
  commission: 0,
  status: 1
})

const rules = {
  product_title: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  commission: [{ required: true, message: '请输入商品利润率', trigger: 'blur' }]
}

const resolveProductImageUrl = value => {
  if (!value) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  const baseUrl = import.meta.env.VITE_API_URL || ''
  if (!baseUrl) {
    return value
  }

  const origin = baseUrl.replace(/\/admin\/?$/, '').replace(/\/$/, '')
  return value.startsWith('/') ? `${origin}${value}` : `${origin}/${value}`
}

const previewImageUrl = computed(() => resolveProductImageUrl(formState.product_pic))

watch(() => props.visible, (visible) => {
  if (visible) {
    if (props.editData) {
      Object.assign(formState, {
        id: props.editData.id,
        product_title: props.editData.product_title,
        product_info: props.editData.product_info || '',
        product_link: props.editData.product_link || '',
        product_pic: props.editData.product_pic,
        price: Number(props.editData.price),
        commission: Number(props.editData.commission),
        status: props.editData.status
      })
      
      if (props.editData.product_pic) {
        fileList.value = [{
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: resolveProductImageUrl(props.editData.product_pic)
        }]
      }
    } else {
      resetForm()
    }
  }
})

function resetForm() {
  Object.assign(formState, {
    id: null,
    product_title: '',
    product_info: '',
    product_link: '',
    product_pic: '',
    price: 0,
    commission: 0,
    status: 1
  })
  fileList.value = []
}

function handleCancel() {
  emit('update:visible', false)
  formRef.value?.resetFields()
  fileList.value = []
  formState.product_pic = ''
}

function beforeUpload(file) {
  const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5
  
  if (!isImage) message.error('只能上传JPG/PNG/GIF/WEBP格式的图片!')
  if (!isLt5M) message.error('图片大小不能超过5MB!')
  
  return isImage && isLt5M
}

async function handleUpload({ file, onSuccess, onError }) {
  uploadLoading.value = true
  
  try {
    const { data } = await uploadImage(file)
    if (data?.code === 200) {
      const url = data.data.url
      formState.product_pic = url
      fileList.value = [{ uid: '-1', name: file.name, status: 'done', url: resolveProductImageUrl(url) }]
      onSuccess(data, file)
      message.success('上传成功')
    } else {
      throw new Error(data?.message || '上传失败')
    }
  } catch (error) {
    onError(error)
    message.error(error.message || '上传失败')
  } finally {
    uploadLoading.value = false
  }
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
    emit('submit', { ...formState })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style lang="less" scoped>
.upload-wrapper {
  .preview-image {
    width: 100%;
    height: 100%;
    position: relative;
  }
}

.pic-input {
  margin-top: 8px;
}

:deep(.ant-upload-select-picture-card) {
  width: 104px;
  height: 104px;
}
</style>
