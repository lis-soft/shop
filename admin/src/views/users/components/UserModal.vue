<template>
  <a-modal
    :title="title"
    :open="visible"
    @cancel="handleCancel"
    :maskClosable="true"
    :destroyOnClose="true"
    :confirmLoading="loading"
    width="600px"
  >
    <a-form
      ref="formRef"
      :model="formState"
      layout="vertical"
      name="user_form"
    >
      <a-tabs>
        <a-tab-pane key="basic" tab="基本信息">
          <a-form-item name="username" label="用户名">
            <a-input v-model:value="formState.username" placeholder="请输入用户名" />
          </a-form-item>
          
          <a-form-item name="phone" label="手机号">
            <div class="phone-field-row">
              <a-select
                :value="formState.phone_country_iso"
                class="phone-country-select"
                show-search
                placeholder="选择区号"
                :options="countrySelectOptions"
                :filter-option="filterCountryOption"
                @change="onPhoneCountryChange"
              />
              <a-input
                :value="formState.phone_number"
                class="phone-number-input"
                placeholder="请输入手机号"
                @input="onPhoneInput"
              />
            </div>
          </a-form-item>
          
          <a-form-item name="login_pwd" label="密码" v-if="!editData">
            <a-input-password v-model:value="formState.login_pwd" placeholder="请输入密码，不填则使用默认密码" />
          </a-form-item>
          <a-form-item name="login_pwd" label="密码" v-else>
            <a-input-password v-model:value="formState.login_pwd" placeholder="不修改密码请留空" />
          </a-form-item>
          
          <a-form-item name="pay_pwd" label="支付密码" v-if="!editData">
            <a-input-password v-model:value="formState.pay_pwd" placeholder="请输入支付密码，不填则使用默认密码" />
          </a-form-item>
          <a-form-item name="pay_pwd" label="支付密码" v-else>
            <a-input-password v-model:value="formState.pay_pwd" placeholder="不修改支付密码请留空" />
          </a-form-item>
          
          <a-form-item name="status" label="状态">
            <a-radio-group v-model:value="formState.status">
              <a-radio :value="true">启用</a-radio>
              <a-radio :value="false">禁用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-tab-pane>

        <a-tab-pane key="permission" tab="权限设置">
          <a-form-item name="is_withdraw" label="提现权限">
            <a-radio-group v-model:value="formState.is_withdraw">
              <a-radio :value="1">开启</a-radio>
              <a-radio :value="0">关闭</a-radio>
            </a-radio-group>
          </a-form-item>


          <a-form-item name="is_invite" label="邀请权限">
            <a-radio-group v-model:value="formState.is_invite">
              <a-radio :value="1">开启</a-radio>
              <a-radio :value="0">关闭</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item name="is_task" label="抢单权限">
            <a-radio-group v-model:value="formState.is_task">
              <a-radio :value="1">开启</a-radio>
              <a-radio :value="0">关闭</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item name="vip_level" label="VIP等级">
            <a-select
              v-model:value="formState.vip_level"
              placeholder="请选择VIP等级"
              style="width: 100%"
              :loading="vipLoading"
            >
              <a-select-option v-for="vip in vipLevels" :key="vip.id" :value="vip.vip_level">
                {{ vip.vip_name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item name="credit_score" label="信誉分">
            <a-input
              :value="formState.credit_score === '' ? '' : String(formState.credit_score ?? '')"
              placeholder="请输入 0 到 100 的信誉分"
              @input="onCreditScoreInput"
            />
          </a-form-item>

          <a-form-item name="admin_id" label="代理">
            <a-select
              v-model:value="formState.admin_id"
              placeholder="请选择代理"
              style="width: 100%"
              :loading="adminLoading"
              allowClear
            >
              <a-select-option v-for="admin in adminList" :key="admin.id" :value="admin.id">
                {{ admin.username }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-tab-pane>
      </a-tabs>
    </a-form>

    <template #footer>
      <a-button key="back" @click="handleCancel">取消</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleSubmit">提交</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { computed, ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getVipLevels } from '@/api/vip'
import { getAdminList } from '@/api/user'
import { COUNTRY_OPTIONS, getCountryByIso, getDefaultCountryIso, splitStoredPhone } from '@/utils/phoneCountry'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '新增用户' },
  editData: { type: Object, default: null }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref()
const loading = ref(false)
const vipLevels = ref([])
const vipLoading = ref(false)
const adminList = ref([])
const adminLoading = ref(false)
const countrySelectOptions = COUNTRY_OPTIONS.map(country => ({
  value: country.iso,
  label: `${country.name} ${country.dialCode}`
}))
const initFormState = () => ({
  id: undefined,
  username: '',
  phone_country_iso: getDefaultCountryIso(),
  phone_number: '',
  phone_original_value: '',
  phone_has_explicit_country_code: false,
  phone_touched: false,
  login_pwd: '',
  pay_pwd: '',
  status: true,
  is_withdraw: 1,
  is_invite: 1,
  is_task: 1,
  vip_level: null,
  credit_score: 100,
  admin_id: null
})

const formState = reactive(initFormState())
const selectedCountry = computed(() => getCountryByIso(formState.phone_country_iso))

const normalizeCreditScore = (value) => {
  if (value === undefined || value === null || value === '') {
    return 100
  }

  const parsedValue = Number(value)
  if (!Number.isFinite(parsedValue)) {
    throw new Error('信誉分必须为数字')
  }

  const normalizedValue = Math.round(parsedValue)
  if (normalizedValue < 0 || normalizedValue > 100) {
    throw new Error('信誉分必须在 0 到 100 之间')
  }

  return normalizedValue
}

const validateForm = () => {
  const username = (formState.username || '').trim()
  if (!username) {
    throw new Error('请输入用户名')
  }
  if (username.length < 3 || username.length > 20) {
    throw new Error('用户名长度在 3 到 20 个字符')
  }

  const phoneNumber = (formState.phone_number || '').trim()
  if (phoneNumber && !/^\d+$/.test(phoneNumber)) {
    throw new Error('请输入正确的手机号码')
  }

  if (formState.login_pwd && formState.login_pwd.trim().length < 6) {
    throw new Error('密码长度不能少于 6 个字符')
  }

  if (formState.pay_pwd && formState.pay_pwd.trim().length < 6) {
    throw new Error('支付密码长度不能少于 6 个字符')
  }

  return {
    username,
    phoneNumber,
    creditScore: normalizeCreditScore(formState.credit_score)
  }
}

const resetForm = () => {
  Object.assign(formState, initFormState())
}
const fillEditData = (data) => {
  const parsedPhone = splitStoredPhone(data.phone)
  Object.assign(formState, {
    id: data.id,
    username: data.username || '',
    phone_country_iso: parsedPhone.countryIso,
    phone_number: parsedPhone.phoneNumber,
    phone_original_value: parsedPhone.rawPhone,
    phone_has_explicit_country_code: parsedPhone.hasExplicitCountryCode,
    phone_touched: false,
    status: data.activeInfo ? data.activeInfo.status === 1 : data.status === 1,
    is_withdraw: data.is_withdraw ?? 1,
    is_invite: data.is_invite ?? 1,
    is_task: data.is_task ?? 1,
    vip_level: data.vip?.vip_level || null,
    credit_score: data.creditScore ?? data.credit_score ?? 100,
    admin_id: data.admin_id || null,
    login_pwd: '',
    pay_pwd: ''
  })
}
watch(() => props.visible, (visible) => {
  if (visible) {
    fetchVipLevels()
    fetchAdminList()
    if (props.editData) {
      fillEditData(props.editData)
    } else {
      resetForm()
    }
  }
})

const handleCancel = () => {
  emit('update:visible', false)
}
const onPhoneInput = (e) => {
  formState.phone_touched = true
  formState.phone_number = e.target.value.replace(/\D/g, '')
}
const onPhoneCountryChange = (iso) => {
  formState.phone_country_iso = iso || getDefaultCountryIso()
  formState.phone_touched = true
}
const filterCountryOption = (input, option) => {
  const keyword = String(input || '').trim().toLowerCase()
  const country = COUNTRY_OPTIONS.find(item => item.iso === option?.value)
  if (!country) {
    return false
  }

  if (!keyword) {
    return true
  }

  return country.name.toLowerCase().includes(keyword)
    || country.iso.toLowerCase().includes(keyword)
    || country.dialCode.toLowerCase().includes(keyword)
}
const onCreditScoreInput = (e) => {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 3)
  formState.credit_score = digits === '' ? '' : Math.min(Number(digits), 100)
}

async function fetchVipLevels() {
  try {
    vipLoading.value = true
    const response = await getVipLevels()
    if (response.data?.data?.list) {
      vipLevels.value = response.data.data.list
    }
  } catch (error) {
    message.error('获取VIP等级失败')
  } finally {
    vipLoading.value = false
  }
}

async function fetchAdminList() {
  try {
    adminLoading.value = true
    const response = await getAdminList()
    if (response.data?.data?.list) {
      adminList.value = response.data.data.list
    }
  } catch (error) {
    message.error('获取代理列表失败')
  } finally {
    adminLoading.value = false
  }
}
const handleSubmit = async () => {
  try {
    const { username, phoneNumber, creditScore } = validateForm()
    loading.value = true
    const shouldPreserveLegacyPhone = Boolean(
      formState.phone_original_value &&
      !formState.phone_has_explicit_country_code &&
      !formState.phone_touched &&
      formState.phone_original_value.replace(/\D/g, '') === phoneNumber
    )
    const normalizedPhone = !phoneNumber
      ? ''
      : shouldPreserveLegacyPhone
        ? formState.phone_original_value
        : `${selectedCountry.value?.dialCode || ''} ${phoneNumber}`.trim()
    const submitData = {
      id: formState.id,
      username,
      phone: normalizedPhone,
      status: formState.status,
      is_withdraw: formState.is_withdraw,
      is_invite: formState.is_invite,
      is_task: formState.is_task,
      vip_level: formState.vip_level,
      credit_score: creditScore,
      admin_id: formState.admin_id
    }
    if (formState.login_pwd && formState.login_pwd.trim()) {
      submitData.login_pwd = formState.login_pwd
    }
    if (formState.pay_pwd && formState.pay_pwd.trim()) {
      submitData.pay_pwd = formState.pay_pwd
    }

    emit('submit', submitData)
  } catch (error) {
    message.error(error.message || '请检查表单填写是否正确')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-tabs-content) {
  padding-top: 8px;
}

.phone-field-row {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: 12px;
}

.phone-country-select,
.phone-number-input {
  width: 100%;
}
</style>
