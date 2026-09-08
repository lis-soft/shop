<template>
  <a-modal
    :visible="visible"
    :title="title"
    :width="480"
    ok-text="确定"
    cancel-text="取消"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item label="用户名" name="username">
        <a-input
          v-model:value="formState.username"
          placeholder="请输入用户名"
          :disabled="!!editData"
        />
      </a-form-item>

      <a-form-item label="姓名" name="name">
        <a-input
          v-model:value="formState.name"
          placeholder="请输入姓名"
        />
      </a-form-item>

      <a-form-item label="手机号" name="phone">
        <a-input
          v-model:value="formState.phone"
          placeholder="请输入手机号"
        />
      </a-form-item>

      <a-form-item label="邮箱" name="email">
        <a-input
          v-model:value="formState.email"
          placeholder="请输入邮箱"
        />
      </a-form-item>

      <a-form-item label="角色" name="role_id">
        <a-select
          v-model:value="formState.role_id"
          placeholder="请选择角色"
          :loading="roleLoading"
          :allowClear="false"
        >
          <a-select-option v-for="role in roleList" :key="role.id" :value="role.id">
            {{ role.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="状态" name="status">
        <a-select
          v-model:value="formState.status"
          placeholder="请选择状态"
          :allowClear="false"
        >
          <a-select-option :value="1">启用</a-select-option>
          <a-select-option :value="0">禁用</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        v-if="!editData"
        label="密码"
        name="password"
      >
        <a-input-password
          v-model:value="formState.password"
          placeholder="请输入密码"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import axios from '@/utils/request'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '新增管理员'
  },
  editData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref()
const roleLoading = ref(false)
const roleList = ref([])

const formState = reactive({
  username: '',
  name: '',
  phone: '',
  email: '',
  role_id: null,
  status: 1,
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role_id: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change', type: 'number' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const fetchRoles = async () => {
  roleLoading.value = true
  try {
    const response = await axios.get('/admin/admin-groups', {
      params: {
        pageSize: 100,
        status: 1
      }
    })
    if (response.data?.data?.list) {
      roleList.value = response.data.data.list
      if (!props.editData && !formState.role_id && roleList.value.length > 0) {
        formState.role_id = roleList.value[0].id
      }
    }
  } catch (error) {
    console.error('获取角色列表失败', error)
  } finally {
    roleLoading.value = false
  }
}

const resetForm = () => {
  formState.username = ''
  formState.name = ''
  formState.phone = ''
  formState.email = ''
  formState.role_id = roleList.value.length > 0 ? roleList.value[0].id : null
  formState.status = 1
  formState.password = ''
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    emit('submit', { ...formState, id: props.editData?.id })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleCancel = () => {
  emit('update:visible', false)
  resetForm()
}

watch(() => props.editData, (newVal) => {
  if (newVal) {
    formState.username = newVal.username || ''
    formState.name = newVal.realName || ''
    formState.phone = newVal.mobile || ''
    formState.email = newVal.email || ''
    
    if (typeof newVal.status === 'boolean') {
      formState.status = newVal.status ? 1 : 0
    } else {
      formState.status = Number(newVal.status) || 1
    }
    
    if (newVal.adminGroup) {
      formState.role_id = newVal.adminGroup.id
    }
  } else {
    resetForm()
    if (roleList.value.length > 0) {
      formState.role_id = roleList.value[0].id
    }
  }
}, { immediate: true })

onMounted(() => {
  fetchRoles()
})
</script>
