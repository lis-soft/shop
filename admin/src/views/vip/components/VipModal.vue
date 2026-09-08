<template>
  <a-modal
    :visible="visible"
    :title="title"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="600px"
    ok-text="确定"
    cancel-text="取消"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="VIP等级" name="vip_level">
        <a-input-number
          v-model:value="formState.vip_level"
          :min="1"
          :max="99"
          placeholder="请输入VIP等级"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="VIP名称" name="vip_name">
        <a-input
          v-model:value="formState.vip_name"
          placeholder="请输入VIP名称"
        />
      </a-form-item>

      <a-form-item label="VIP图标" name="vip_image">
        <a-upload
          :file-list="fileList"
          list-type="picture-card"
          :custom-request="handleUpload"
          :show-upload-list="false"
          accept="image/*"
          :before-upload="beforeUpload"
          @change="handleFileChange"
        >
          <div v-if="formState.vip_image" class="upload-preview">
            <img :src="previewImageUrl" alt="VIP图标" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div v-else class="upload-placeholder">
            <plus-outlined />
            <div style="margin-top: 8px">上传图标</div>
          </div>
        </a-upload>
      </a-form-item>

      <a-form-item label="激活余额" name="balance_limit">
        <a-input-number
          v-model:value="formState.balance_limit"
          :min="0"
          :precision="2"
          placeholder="请输入激活所需余额"
          style="width: 100%"
          addon-after="元"
        />
      </a-form-item>

      <a-form-item label="利润率" name="reward_rate">
        <a-input-number
          v-model:value="formState.reward_rate"
          :min="0"
          :max="100"
          :precision="2"
          placeholder="请输入利润率"
          style="width: 100%"
          addon-after="%"
        />
      </a-form-item>

      <a-form-item label="卡单利润率" name="card_reward_rate">
        <a-input-number
          v-model:value="formState.card_reward_rate"
          :min="0"
          :max="100"
          :precision="2"
          placeholder="请输入卡单利润率，不填则使用利润率"
          style="width: 100%"
          addon-after="%"
        />
      </a-form-item>

      <a-form-item label="每日套数" name="daily_sets">
        <a-input-number
          v-model:value="formState.daily_sets"
          :min="1"
          placeholder="请输入每日套数"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="每套任务数" name="task_count">
        <a-input-number
          v-model:value="formState.task_count"
          :min="1"
          placeholder="请输入每套任务数"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="最低薪资" name="min_salary">
        <a-input-number
          v-model:value="formState.min_salary"
          :min="0"
          :precision="2"
          placeholder="请输入最低薪资"
          style="width: 100%"
          addon-after="元"
        />
      </a-form-item>

      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="formState.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed, ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { uploadImage } from '@/api/upload'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '新增VIP等级' },
  editData: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref()
const fileList = ref([])

const initFormState = () => ({
  id: undefined,
  vip_level: null,
  vip_name: '',
  vip_image: '',
  balance_limit: null,
  reward_rate: null,
  card_reward_rate: null,
  daily_sets: null,
  task_count: null,
  min_salary: null,
  status: 1
})

const formState = reactive(initFormState())

const rules = {
  vip_level: [{ required: true, message: '请输入VIP等级', trigger: 'blur' }],
  vip_name: [{ required: true, message: '请输入VIP名称', trigger: 'blur' }],
  balance_limit: [{ required: true, message: '请输入激活余额', trigger: 'blur' }],
  reward_rate: [{ required: true, message: '请输入利润率', trigger: 'blur' }],
  daily_sets: [{ required: true, message: '请输入每日套数', trigger: 'blur' }],
  task_count: [{ required: true, message: '请输入每套任务数', trigger: 'blur' }],
  min_salary: [{ required: true, message: '请输入最低薪资', trigger: 'blur' }]
}

const resolveVipImageUrl = value => {
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

const previewImageUrl = computed(() => resolveVipImageUrl(formState.vip_image))

const resetForm = () => {
  Object.assign(formState, initFormState())
  fileList.value = []
}

const fillEditData = (data) => {
  Object.assign(formState, {
    id: data.id,
    vip_level: data.vip_level,
    vip_name: data.vip_name,
    vip_image: data.vip_image,
    balance_limit: data.balance_limit,
    reward_rate: data.reward_rate,
    card_reward_rate: data.card_reward_rate,
    daily_sets: data.daily_sets,
    task_count: data.task_count,
    min_salary: data.min_salary,
    status: data.status
  })

  fileList.value = data.vip_image
    ? [{
        uid: '-1',
        name: 'vip-icon.png',
        status: 'done',
        url: resolveVipImageUrl(data.vip_image)
      }]
    : []
}

watch(() => props.visible, (visible) => {
  if (visible) {
    if (props.editData) {
      fillEditData(props.editData)
    } else {
      resetForm()
    }
  }
})

const handleCancel = () => {
  emit('update:visible', false)
  formRef.value?.resetFields()
  fileList.value = []
  formState.vip_image = ''
}

const beforeUpload = file => {
  const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) message.error('只能上传JPG/PNG/GIF/WEBP格式的图片!')
  if (!isLt5M) message.error('图片大小不能超过5MB!')

  return isImage && isLt5M
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    const submitData = {
      id: formState.id,
      vip_level: formState.vip_level,
      vip_name: formState.vip_name,
      vip_image: formState.vip_image,
      balance_limit: formState.balance_limit,
      reward_rate: formState.reward_rate,
      card_reward_rate: formState.card_reward_rate,
      daily_sets: formState.daily_sets,
      task_count: formState.task_count,
      min_salary: formState.min_salary,
      status: formState.status
    }

    emit('submit', submitData)
  } catch (error) {
    message.error('请检查表单填写是否正确')
  }
}

const handleFileChange = ({ fileList: newFileList }) => {
  fileList.value = newFileList
}

const handleUpload = async ({ file, onSuccess, onError }) => {
  try {
    const res = await uploadImage(file)
    if (res.data.code === 200) {
      const imageUrl = res.data.data.url
      formState.vip_image = imageUrl
      fileList.value = [{
        uid: '-1',
        name: file.name,
        status: 'done',
        url: resolveVipImageUrl(imageUrl)
      }]
      onSuccess(res.data.data.url)
      message.success('图片上传成功')
    } else {
      onError(new Error(res.data.message ?? '上传失败'))
    }
  } catch (error) {
    onError(error)
  }
}
</script>

<style scoped>
.upload-preview {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
}

.upload-placeholder {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: #1890ff;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}
</style>
