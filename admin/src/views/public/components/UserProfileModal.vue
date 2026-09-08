<template>
  <a-modal
    :visible="visible"
    title="个人中心"
    width="700px"
    :footer="null"
    @cancel="handleCancel"
    :bodyStyle="{ padding: '24px' }"
  >
    <div class="profile-container">
      <a-tabs @change="handleTabChange">
        <a-tab-pane key="basic" tab="基本资料">
          <div class="profile-header">
            <a-upload
              name="avatar"
              :show-upload-list="false"
              :before-upload="beforeUpload"
            >
              <div class="avatar-container">
                <a-avatar :size="104" class="avatar" :src="formState.avatar">
                </a-avatar>
                <div class="avatar-mask">
                  <camera-outlined />
                  <p>更换头像</p>
                </div>
              </div>
            </a-upload>
          </div>

          <a-divider style="margin: 12px 0" />

          <a-form
            ref="formRef"
            :model="formState"
            :rules="formRules"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-form-item label="用户名" name="username">
              <a-input v-model:value="formState.username" placeholder="请输入用户名" disabled />
            </a-form-item>
            <a-form-item label="真实姓名" name="realName">
              <a-input v-model:value="formState.realName" placeholder="请输入真实姓名" />
            </a-form-item>
            <a-form-item label="手机号码" name="mobile">
              <a-input v-model:value="formState.mobile" placeholder="请输入手机号码" />
            </a-form-item>
            <a-form-item label="邮箱" name="email">
              <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 4 }">
              <a-button type="primary" @click="saveBasicInfo">保存</a-button>
              <a-button style="margin-left: 8px" @click="handleCancel">取消</a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="password" tab="修改密码">
          <a-form
            :model="passwordForm"
            :rules="passwordRules"
            ref="passwordFormRef"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 16 }"
          >
            <a-form-item label="当前密码" name="oldPassword">
              <a-input-password v-model:value="passwordForm.oldPassword" placeholder="请输入当前密码" />
            </a-form-item>
            <a-form-item label="新密码" name="newPassword">
              <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
            </a-form-item>
            <a-form-item label="确认新密码" name="confirmPassword">
              <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请确认新密码" />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 4 }">
              <a-button type="primary" @click="handlePasswordChange">保存</a-button>
              <a-button style="margin-left: 8px" @click="resetPasswordForm">重置</a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="loginLog" tab="登录日志">
          <a-table
            :columns="logColumns"
            :data-source="loginLogs"
            :pagination="{ pageSize: 5 }"
            :bordered="false"
            size="middle"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status ? 'success' : 'error'">
                  {{ record.status ? '成功' : '失败' }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined, CameraOutlined } from '@ant-design/icons-vue'
import { getProfile, updateProfile, updateUserAvatar, changePassword, getLoginLogs } from '@/api/admin'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'avatar-updated', 'profile-updated'])

const formState = reactive({
  username: '',
  realName: '',
  mobile: '',
  email: ''
})

const logColumns = [
  {
    title: '登录IP',
    dataIndex: 'ip',
    key: 'ip',
    width: 140
  },
  {
    title: '登录地点',
    dataIndex: 'location',
    key: 'location',
    width: 160
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80
  },
  {
    title: '登录时间',
    dataIndex: 'loginTime',
    key: 'loginTime',
    width: 180
  }
]

const loginLogs = ref([])

const fetchLoginLogs = async () => {
  try {
    const res = await getLoginLogs()
    loginLogs.value = res.data.data.map(log => ({
      key: log.id,
      loginTime: log.created_at,
      ip: log.ip || '-',
      location: log.ip || '-',
      status: log.status === 200
    }))
  } catch (error) {
  }
}

const fetchUserProfile = async () => {
  try {
    const res = await getProfile()
    const profile = res.data.data
    Object.assign(formState, profile)
  } catch (error) {
  }
}

const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码' }],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码长度不能少于6个字符' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码' },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      }
    }
  ]
}

const handlePasswordChange = async () => {
  try {
    await passwordFormRef.value.validate()
    const res = await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    message.success(res.data.message)
    resetPasswordForm()
    
    setTimeout(() => {
      emit('update:visible', false)
      
      setTimeout(() => {
        localStorage.removeItem('token')
        router.push('/login')
      }, 500)
    }, 300)
  } catch (error) {
  }
}

const resetPasswordForm = () => {
  passwordFormRef.value?.resetFields()
}

const beforeUpload = async (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传JPG/PNG格式的图片')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过2MB')
    return false
  }
  
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await updateUserAvatar(formData)
    formState.avatar = res.data.data.avatar
    message.success(res.data.message)
    
    emit('avatar-updated', formState.avatar)
  } catch (error) {
    message.error(error.response?.data?.message || '头像上传失败')
  }
  return false
}

const formRules = {
  mobile: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

const formRef = ref(null)

const saveBasicInfo = async () => {
  try {
    await formRef.value.validate()
    
    const res = await updateProfile({
      realName: formState.realName,
      mobile: formState.mobile,
      email: formState.email
    })
    message.success(res.data.message)
    
    emit('profile-updated')
    
    emit('update:visible', false)
  } catch (error) {
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}

const handleTabChange = (activeKey) => {
  if (activeKey === 'loginLog') {
    fetchLoginLogs()
  } else if (activeKey === 'basic') {
    fetchUserProfile()
  }
}

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await fetchUserProfile()
    await fetchLoginLogs()
  }
})

onMounted(async () => {
  if (props.visible) {
    await fetchUserProfile()
    await fetchLoginLogs()
  }
})
</script>

<style lang="less" scoped>
.profile-container {
  .profile-header {
    display: flex;
    justify-content: center;
    padding: 16px 0;
    
    .avatar-container {
      position: relative;
      display: inline-block;
      cursor: pointer;
      border-radius: 50%;
      overflow: hidden;
      
      .avatar {
        background-color: #1890ff;
        font-size: 48px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      
      .avatar-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        opacity: 0;
        transition: opacity 0.3s;
        
        .anticon {
          font-size: 24px;
          margin-bottom: 4px;
        }
        
        p {
          margin: 0;
          font-size: 12px;
        }
      }
      
      &:hover .avatar-mask {
        opacity: 1;
      }
    }
  }
  
  :deep(.ant-tabs-nav) {
    margin-bottom: 16px;
  }
  
  :deep(.ant-form-item:last-child) {
    margin-bottom: 0;
  }
}
</style> 