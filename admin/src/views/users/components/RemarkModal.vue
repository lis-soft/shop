<template>
  <a-modal
    :visible="visible"
    title="编辑备注"
    :mask-closable="true"
    @cancel="handleCancel"
    :centered="true"
    :footer="null"
    :bodyStyle="{ padding: '24px' }"
  >
    <div class="remark-container">
      <div class="remark-header">
        <message-outlined />
        <div class="remark-title">用户备注信息</div>
      </div>
      
      <a-divider />
      
      <a-form layout="vertical">
        <a-form-item>
          <template #label>
            <div class="form-label">
              <edit-outlined />
              <span>备注内容</span>
            </div>
          </template>
          
          <a-textarea
            v-model:value="remark"
            :rows="6"
            placeholder="请输入备注信息"
            @pressEnter="handleSubmit"
            class="remark-textarea"
            :maxLength="500"
            showCount
          />
        </a-form-item>
        
        <div class="remark-tips">
          <info-circle-outlined />
          <span>备注信息仅供管理员查看，不会展示给用户</span>
        </div>
        
        <div class="remark-footer">
          <a-button type="primary" @click="handleSubmit">
            <template #icon><save-outlined /></template>
            保存
          </a-button>
          <a-button @click="handleCancel" style="margin-left: 12px;">
            <template #icon><close-outlined /></template>
            取消
          </a-button>
        </div>
      </a-form>
    </div>
  </a-modal>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import { 
  SaveOutlined, MessageOutlined, EditOutlined, 
  InfoCircleOutlined, CloseOutlined 
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { updateUser } from '@/api/user';

export default defineComponent({
  name: 'RemarkModal',
  components: {
    SaveOutlined,
    MessageOutlined,
    EditOutlined,
    InfoCircleOutlined,
    CloseOutlined
  },
  props: {
    userId: {
      type: [Number, String],
      required: true
    },
    initialRemark: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'success'],
  setup(props, { emit }) {
    const remark = ref(props.initialRemark);
    
    // 监听visible属性变化，当显示时重置remark
    watch(() => props.visible, (newVal) => {
      if (newVal) {
        remark.value = props.initialRemark;
      }
    });
    
    // 监听initialRemark属性变化
    watch(() => props.initialRemark, (newVal) => {
      remark.value = newVal;
    });
    
    const handleSubmit = async () => {
      try {
        await updateUser(props.userId, { remarks: remark.value });
        message.success('备注更新成功');
        emit('success', remark.value);
        emit('update:visible', false);
      } catch (error) {
        message.error('备注更新失败');
        console.error(error);
      }
    };

    const handleCancel = () => {
      emit('update:visible', false);
    };

    return {
      remark,
      handleSubmit,
      handleCancel
    };
  }
});
</script>

<style lang="less" scoped>
.remark-container {
  .remark-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    :deep(.anticon) {
      font-size: 24px;
      color: #1890ff;
      margin-right: 12px;
    }
    
    .remark-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .form-label {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    :deep(.anticon) {
      font-size: 16px;
      color: #1890ff;
      margin-right: 8px;
    }
    
    span {
      font-weight: 500;
      color: #333;
    }
  }
  
  .remark-textarea {
    border-radius: 4px;
    resize: none;
    font-size: 14px;
    transition: all 0.3s;
    
    &:hover, &:focus {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }
  
  .remark-tips {
    display: flex;
    align-items: center;
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 24px;
    
    :deep(.anticon) {
      color: #52c41a;
      margin-right: 8px;
    }
    
    span {
      color: #555;
      font-size: 14px;
    }
  }
  
  .remark-footer {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
}
</style> 