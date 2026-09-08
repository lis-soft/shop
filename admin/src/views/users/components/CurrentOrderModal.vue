<template>
  <a-modal
    :visible="visible"
    title="当前订单设置"
    :mask-closable="true"
    @cancel="handleCancel"
    :centered="true"
    :width="960"
    :footer="null"
    :bodyStyle="{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }"
  >
    <div class="current-order-container">
      <a-spin :spinning="loading">
        <!-- 用户基本信息卡片 -->
        <a-card class="info-card" :bordered="false">
          <div class="user-info-header">
            <div class="user-avatar">
              <a-avatar :size="64" v-if="userData.avatar" :src="userData.avatar" />
            </div>
            <div class="user-details">
              <h2>{{ userData.username }}</h2>
              <div class="user-meta">
                <span class="meta-item">
                  <wallet-outlined />
                  余额: {{ formatMoney(userData.balance) }}
                </span>
                <span class="meta-item">
                  <schedule-outlined />
                  任务进度: {{ userData.taskCount }}
                </span>
              </div>
            </div>
          </div>
        </a-card>

        <!-- 无数据显示 -->
        <div v-if="!taskData" class="empty-data-container">
          <a-empty description="暂无派单设置">
            <template #description>
              <span class="empty-text">该用户尚未配置派单设置</span>
            </template>
          </a-empty>
        </div>
        
        <!-- 任务设置信息 -->
        <div v-else class="task-info-container">
          <!-- 基本设置 -->
          <a-card class="setting-card" title="基本设置" :bordered="true">
            <div class="setting-item">
              <div class="setting-label">
                <setting-outlined />
                <span>订单开始条件:</span>
              </div>
              <div class="setting-value">
                <template v-if="orderStartConditions.length > 0">
                  <span>开始序号：</span>
                  <a-tag
                    v-for="startAfter in orderStartConditions"
                    :key="startAfter"
                    color="blue"
                  >
                    {{ startAfter }}
                  </a-tag>
                </template>
                <template v-else>
                  开始序号：<a-tag color="blue">{{ taskData.start_after || 0 }}</a-tag>
                </template>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-label">
                <safety-outlined />
                <span>当前状态:</span>
              </div>
              <div class="setting-value">
                <a-tag :color="taskData.status === 1 ? 'success' : 'error'">
                  {{ taskData.status === 1 ? '启用' : '禁用' }}
                </a-tag>
              </div>
            </div>
          </a-card>

          <!-- 连续订单 -->
          <a-card class="order-card" title="连续订单" :bordered="true">
            <template #extra>
              <unordered-list-outlined />
            </template>
            <div v-if="continuousOrders && continuousOrders.length > 0" class="order-content">
              <a-row :gutter="[16, 16]">
                <a-col :xs="24" :sm="12" :md="8" v-for="(item, index) in continuousOrders" :key="index">
                  <a-card class="order-item-card" size="small">
                    <div class="order-number">
                      订单 #{{ index + 1 }}
                      <a-button type="link" size="small" class="delete-btn" @click.stop="deleteContinuousOrder(item)">删除</a-button>
                    </div>
                    <div class="order-detail-item">
                      <span class="detail-label">商品ID:</span>
                      <a-tag color="blue">{{ item.product_id }}</a-tag>
                    </div>
                    <div class="order-detail-item">
                      <span class="detail-label">价格:</span>
                      <span class="detail-value price">{{ getOrderPrice(item) }}</span>
                    </div>
                    <div class="order-detail-item">
                      <span class="detail-label">利润率:</span>
                      <span class="detail-value commission">{{ formatRate(item.commission) }}</span>
                    </div>
                    <div class="order-detail-item">
                      <span class="detail-label">开始序号:</span>
                      <a-tag color="blue">{{ item.start_after }}</a-tag>
                    </div>
                  </a-card>
                </a-col>
              </a-row>
            </div>
            <div v-else class="no-order-data">
              <a-empty description="暂无连续订单" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
            </div>
          </a-card>
        </div>

        <!-- 底部按钮 -->
        <div class="modal-footer">
          <a-space>
            <a-button @click="handleCancel">
              关闭
            </a-button>
            <a-button 
              type="primary" 
              @click="handleEditOrder" 
              v-if="taskData"
            >
              <template #icon><edit-outlined /></template>
              编辑设置
            </a-button>
          </a-space>
        </div>
      </a-spin>
    </div>
  </a-modal>
</template>

<script>
import { computed, defineComponent, ref, watch } from 'vue';
import { message, Empty } from 'ant-design-vue';
import { 
  EditOutlined, 
  WalletOutlined, 
  ScheduleOutlined, 
  SettingOutlined, 
  SafetyOutlined,
  UnorderedListOutlined
} from '@ant-design/icons-vue';
import { getUserTask, updateUserLuckyOrder, updateUserContinuousOrder } from '@/api/user';
import { getProduct } from '@/api/product';

export default defineComponent({
  name: 'CurrentOrderModal',
  components: {
    EditOutlined,
    WalletOutlined,
    ScheduleOutlined,
    SettingOutlined,
    SafetyOutlined,
    UnorderedListOutlined
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    userData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:visible', 'edit-order'],
  setup(props, { emit }) {
    const loading = ref(false);
    const taskData = ref(null);
    const luckyOrders = ref([]);
    const continuousOrders = ref([]);
    const productPrices = ref({});

    const orderStartConditions = computed(() => {
      return [...new Set(
        continuousOrders.value
          .map(order => Number(order.start_after))
          .filter(startAfter => Number.isFinite(startAfter))
      )].sort((a, b) => a - b);
    });
    
    const fetchUserTask = async () => {
      if (!props.userData || !props.userData.id) return;
      
      loading.value = true;
      try {
        const res = await getUserTask(props.userData.id);
        if (res?.data?.data) {
          taskData.value = res.data.data;
          luckyOrders.value = parseOrderList(taskData.value.lucky_order, 'lucky');
          const continuousOrderSettings = parseOrderList(taskData.value.continuous_order, 'continuous');
          continuousOrders.value = [...continuousOrderSettings, ...luckyOrders.value]
            .sort((a, b) => Number(a.start_after || 0) - Number(b.start_after || 0));
          
          await fetchProductPrices();
        } else {
          taskData.value = null;
          luckyOrders.value = [];
          continuousOrders.value = [];
        }
      } catch (error) {
        console.error('获取用户任务失败:', error);
        message.error('获取用户任务失败');
        taskData.value = null;
        luckyOrders.value = [];
        continuousOrders.value = [];
      } finally {
        loading.value = false;
      }
    };

    const parseOrderList = (value, source) => {
      if (!value) return [];

      try {
        let parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
          parsed = parsed.flat();
        }

        return (Array.isArray(parsed) ? parsed : [parsed])
          .filter(Boolean)
          .map((item, index) => ({
            ...item,
            __source: source,
            __uid: `${source}-${item.product_id || 'unknown'}-${item.start_after || 0}-${index}`
          }));
      } catch (e) {
        console.error(`解析${source === 'lucky' ? '卡单' : '连续订单'}失败:`, e);
        return [];
      }
    };

    const stripOrderMeta = (order) => {
      const { __source, __uid, ...rest } = order;
      return rest;
    };

    const isSameOrder = (order, target) => (
      order.__source === target.__source &&
      order.product_id === target.product_id &&
      order.commission === target.commission &&
      order.start_after === target.start_after
    );
    
    const fetchProductPrices = async () => {
      const productIds = new Set();
      continuousOrders.value.forEach(order => {
        if (order.product_id) productIds.add(order.product_id);
      });
      
      for (const productId of productIds) {
        try {
          const res = await getProduct(productId);
          if (res?.data?.data) {
            productPrices.value[productId] = res.data.data.price;
          }
        } catch (error) {
          console.error(`获取商品${productId}信息失败:`, error);
        }
      }
    };
    
    watch(() => props.visible, (newVal) => {
      if (newVal && props.userData && props.userData.id) {
        fetchUserTask();
      }
    });
    
    const handleCancel = () => {
      emit('update:visible', false);
    };
    
    const handleEditOrder = () => {
      emit('edit-order', props.userData);
      emit('update:visible', false);
    };
    
    const formatMoney = (value) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : (Number(value) || 0);
      return `$ ${Math.abs(numValue).toFixed(2)}`;
    };

    const formatRate = (value) => {
      const numericValue = Number(value || 0);
      if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return '0.00%';
      }

      const normalizedRate = numericValue > 0 && numericValue < 1 ? numericValue * 100 : numericValue;
      return `${normalizedRate.toFixed(2)}%`;
    };
    
    const getOrderPrice = (order) => {
      if (order.price !== undefined && order.price !== null && order.price !== '') {
        return formatMoney(order.price);
      }

      const price = productPrices.value[order.product_id];
      if (price !== undefined) {
        return formatMoney(price);
      }
      return '加载中...';
    };

    const deleteLuckyOrder = async (item) => {
      const newOrders = luckyOrders.value.filter(
        o => !isSameOrder(o, item)
      )
      luckyOrders.value = newOrders
      if (taskData.value && taskData.value.user_id) {
        await updateUserLuckyOrder(taskData.value.user_id, JSON.stringify(newOrders.map(stripOrderMeta)))
        message.success('删除成功')
        fetchUserTask()
      }
    }

    const deleteContinuousOrder = async (item) => {
      if (item.__source === 'lucky') {
        return deleteLuckyOrder(item);
      }

      const newOrders = continuousOrders.value.filter(
        o => o.__source === 'continuous' && !isSameOrder(o, item)
      )
      continuousOrders.value = [
        ...newOrders,
        ...luckyOrders.value
      ].sort((a, b) => Number(a.start_after || 0) - Number(b.start_after || 0))
      if (taskData.value && taskData.value.user_id) {
        await updateUserContinuousOrder(taskData.value.user_id, JSON.stringify(newOrders.map(stripOrderMeta)))
        message.success('删除成功')
        fetchUserTask()
      }
    }

    return {
      loading,
      taskData,
      luckyOrders,
      continuousOrders,
      orderStartConditions,
      handleCancel,
      handleEditOrder,
      formatMoney,
      formatRate,
      getOrderPrice,
      Empty,
      deleteLuckyOrder,
      deleteContinuousOrder
    };
  }
});
</script>

<style lang="less" scoped>
.current-order-container {
  .info-card {
    margin-bottom: 24px;
    background-color: #fafafa;
    border-radius: 8px;
    
    .user-info-header {
      display: flex;
      align-items: center;
      
      .user-avatar {
        margin-right: 16px;
      }
      
      .user-details {
        h2 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .user-meta {
          display: flex;
          flex-wrap: wrap;
          
          .meta-item {
            display: flex;
            align-items: center;
            margin-right: 24px;
            color: #666;
            
            .anticon {
              margin-right: 8px;
            }
          }
        }
      }
    }
  }
  
  .empty-data-container {
    padding: 40px 0;
    text-align: center;
    
    .empty-text {
      color: #999;
      font-size: 14px;
    }
  }
  
  .task-info-container {
    .setting-card {
      margin-bottom: 24px;
      border-radius: 8px;
      
      .setting-item {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .setting-label {
          display: flex;
          align-items: center;
          width: 120px;
          color: #666;
          font-weight: 500;
          
          .anticon {
            margin-right: 8px;
          }
        }
        
        .setting-value {
          flex: 1;
        }
      }
    }
    
    .order-card {
      margin-bottom: 24px;
      border-radius: 8px;
      
      .order-content {
        padding: 8px 0;
      }
      
      .no-order-data {
        padding: 24px 0;
        text-align: center;
      }
      
      .order-item-card {
        border-radius: 6px;
        border: 1px solid #e8e8e8;
        transition: all 0.3s;
        
        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
        }
        
        .order-number {
          margin-bottom: 12px;
          font-weight: 500;
          color: #333;
          border-bottom: 1px dashed #f0f0f0;
          padding-bottom: 8px;
          display: flex;
          align-items: center;
          .delete-btn {
            margin-left: auto;
            padding-right: 0;
          }
        }
      }
      
      .order-detail-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .detail-label {
          width: 70px;
          color: #666;
          font-size: 13px;
        }
        
        .detail-value {
          flex: 1;
          
          &.price {
            color: #ff4d4f;
            font-weight: bold;
          }
          
          &.commission {
            color: #52c41a;
            font-weight: bold;
          }
        }
      }
    }
  }
  
  .modal-footer {
    margin-top: 24px;
    text-align: center;
  }

  .ant-card-body {
    max-width: 320px;
  }
}
</style> 
