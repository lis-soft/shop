<template>
  <a-modal
    :visible="visible"
    :title="modalTitle"
    :width="800"
    :height="600"
    :confirm-loading="confirmLoading"
    ok-text="确定"
    cancel-text="取消"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
    >
      <a-form-item label="权限组名称" name="name">
        <a-input 
          v-model:value="formData.name" 
          placeholder="请输入权限组名称"
        />
      </a-form-item>
      
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="formData.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
      
      <a-form-item label="权限配置" name="rules">
        <a-tree
          v-model:checkedKeys="formData.rules"
          :tree-data="permissionTree"
          checkable
          :check-strictly="false"
          :default-expand-all="true"
          :field-names="{ children: 'children', title: 'title', key: 'id' }"
        >
          <template #title="{ title, type }">
            <span :class="getNodeClass(type)">
              {{ title }}
            </span>
          </template>
        </a-tree>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { 
  createAdminGroup, 
  updateAdminGroup, 
  getAdminGroupDetail,
  getAllAdminRules 
} from '@/api/adminGroup'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'create' // create, edit
  },
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 响应式数据
const formRef = ref()
const confirmLoading = ref(false)
const permissionTree = ref([])

// 表单数据
const formData = reactive({
  name: '',
  status: 1,
  rules: []
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入权限组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '权限组名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const modalTitle = computed(() => {
  const titles = {
    create: '新增权限组',
    edit: '编辑权限组'
  }
  return titles[props.mode] || '权限组'
})

// 获取节点样式类
const getNodeClass = (type) => {
  const classes = {
    menu_dir: 'node-menu-dir',
    menu: 'node-menu',
    button: 'node-button'
  }
  return classes[type] || ''
}

// 重置表单
const resetForm = () => {
  formData.name = ''
  formData.status = 1
  formData.rules = []
  formRef.value?.resetFields()
}

// 获取权限规则树
const fetchPermissionTree = async () => {
  try {
    const { data } = await getAllAdminRules()
    if (data.code === 200) {
      permissionTree.value = data.data
    }
  } catch (error) {
    console.error('获取权限规则失败:', error)
  }
}

const getDisplayCheckedKeys = (allRules) => {
  const checkedKeys = []
  
  const checkNode = (node) => {
    if (node.type === 'button') {
      if (allRules.includes(node.id)) {
        checkedKeys.push(node.id)
      }
    } else if (node.type === 'menu') {
      if (allRules.includes(node.id)) {
        if (node.children && node.children.length > 0) {
          const allChildrenSelected = node.children.every(child => 
            allRules.includes(child.id)
          )
          if (allChildrenSelected) {
            checkedKeys.push(node.id)
          }
        } else {
          checkedKeys.push(node.id)
        }
      }
    } else if (node.type === 'menu_dir') {
      if (allRules.includes(node.id)) {
        if (node.children && node.children.length > 0) {
          const allChildMenusFullySelected = node.children.every(child => {
            if (!allRules.includes(child.id)) return false
            
            if (child.children && child.children.length > 0) {
              return child.children.every(grandChild => allRules.includes(grandChild.id))
            }
            return true
          })
          
          if (allChildMenusFullySelected) {
            checkedKeys.push(node.id)
          }
        } else {
          checkedKeys.push(node.id)
        }
      }
    }
    
    if (node.children) {
      node.children.forEach(child => checkNode(child))
    }
  }
  
  permissionTree.value.forEach(node => checkNode(node))
  return checkedKeys
}

const fetchDetail = async (id) => {
  try {
    const { data } = await getAdminGroupDetail(id)
    if (data.code === 200) {
      const detail = data.data
      formData.name = detail.name
      formData.status = detail.status
      
      const allRules = detail.rulesArray || []
      formData.rules = getDisplayCheckedKeys(allRules)
    }
  } catch (error) {
    console.error('获取权限组详情失败:', error)
  }
}

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await fetchPermissionTree()
    
    if (props.mode === 'create') {
      resetForm()
    } else if (props.record) {
      await fetchDetail(props.record.id)
    }
  }
})

const getCompleteRules = (checkedKeys) => {
  const completeRules = new Set(checkedKeys)
  
  const addParentNodes = (nodeId) => {
    const findParent = (nodes) => {
      for (const node of nodes) {
        if (node.children && node.children.some(child => child.id === nodeId)) {
          completeRules.add(node.id)
          addParentNodes(node.id)
          return true
        }
        if (node.children && findParent(node.children)) {
          return true
        }
      }
      return false
    }
    findParent(permissionTree.value)
  }
  
  checkedKeys.forEach(nodeId => {
    addParentNodes(nodeId)
  })
  
  return Array.from(completeRules)
}

const handleOk = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true

    const completeRules = getCompleteRules(formData.rules)

    const submitData = {
      name: formData.name,
      status: formData.status,
      rules: completeRules
    }

    let result
    if (props.mode === 'create') {
      result = await createAdminGroup(submitData)
    } else {
      result = await updateAdminGroup(props.record.id, submitData)
    }

    if (result.data.code === 200) {
      message.success(result.data.message)
      emit('success')
    }
  } catch (error) {
    console.error('保存权限组失败:', error)
  } finally {
    confirmLoading.value = false
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<style lang="less" scoped>
:deep(.ant-tree) {
  max-height: 450px;
  overflow-y: auto;
  
  .node-menu-dir {
    font-weight: 600;
    color: #1890ff;
  }
  
  .node-menu {
    color: #52c41a;
  }
  
  .node-button {
    color: #fa8c16;
    font-size: 12px;
  }
}
</style>