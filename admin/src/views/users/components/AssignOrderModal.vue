<template>
  <a-modal
    :visible="visible"
    title="派单设置"
    :mask-closable="true"
    @cancel="handleCancel"
    :centered="true"
    :width="1000"
    :footer="null"
    :bodyStyle="{ padding: '6px', maxHeight: '90vh', overflowY: 'auto' }"
  >
    <div class="assign-order-container">
      <div class="user-info-section">
        <div class="user-info-cards">
          <div class="info-card">
            <div class="info-label">用户名</div>
            <div class="info-value username">{{ userData.username }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">账户余额</div>
            <div class="info-value balance">{{ userData.balance }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">任务进度</div>
            <div class="info-value task">{{ completedTasks }}/{{ userData.vip.task_count }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">VIP等级</div>
            <div class="info-value vip">
              {{ userData.vip?.vip_name || 'N/A' }}
              (自动派单利润率 {{ normalizeRate(userData.vip?.reward_rate || 0) }}% / 手动派单利润率 {{ getManualDispatchRate() }}%)
            </div>
          </div>
        </div>
      </div>

      <div class="search-section">
        <a-form layout="inline">
          <a-form-item label="商品名称">
            <a-input v-model:value="searchForm.keyword" placeholder="请输入商品名称" allowClear />
          </a-form-item>
          <a-form-item label="价格区间">
            <a-input-number v-model:value="searchForm.minPrice" placeholder="最低价" style="width: 100px" />
            <span style="margin: 0 8px;">-</span>
            <a-input-number v-model:value="searchForm.maxPrice" placeholder="最高价" style="width: 100px" />
          </a-form-item>
          <div class="search-buttons">
            <a-button type="primary" @click="handleSearch">
              <template #icon><search-outlined /></template>
              搜索
            </a-button>
            <a-button style="margin-left: 8px" @click="resetSearch">
              <template #icon><reload-outlined /></template>
              重置
            </a-button>
          </div>
        </a-form>
      </div>

      <div class="table-section">
        <a-table
          :columns="columns"
          :data-source="productList"
          :pagination="pagination"
          :loading="loading"
          @change="handleTableChange"
          :row-key="record => record.id"
          size="small"
          :scroll="{ y: 500 }"
          :locale="{ emptyText: '暂无数据' }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'selection'">
              <a-checkbox v-model:checked="record.selected" @change="() => handleSelectProduct(record)" />
            </template>
            <template v-else-if="column.key === 'product_pic'">
              <img v-if="record.product_pic" :src="record.product_pic" class="product-image" alt="商品图片" />
              <span v-else>无图片</span>
            </template>
            <template v-else-if="column.key === 'price'">
              <span class="price">{{ record.price }}</span>
            </template>
            <template v-else-if="column.key === 'commission'">
              <div class="commission-container">
                <a-input-number
                  :value="getManualDispatchRate()"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  style="width: 100px"
                  disabled
                />
              </div>
            </template>
          </template>
        </a-table>
      </div>

      <div class="selected-info">
        <div class="selected-count">
          已选择 <span class="highlight">{{ selectedCount }}</span> 个商品，
          总金额：<span class="highlight">{{ totalAmount }}</span>，
          预计收益：<span class="highlight success">{{ totalCommission }}</span>
        </div>
      </div>

      <div class="order-settings">
        <a-form layout="inline">
          <a-form-item label="从第几单开始">
            <a-input-number
              v-model:value="startAfterOrder"
              :min="0"
              :step="1"
              style="width: 120px"
            />
          </a-form-item>
        </a-form>
        <div class="assigned-order-sequences">
          <span class="sequence-label">已卡单序号：</span>
          <template v-if="assignedOrderSequences.length > 0">
            <a-tag
              v-for="sequence in assignedOrderSequences"
              :key="sequence"
              color="orange"
            >
              {{ sequence }}
            </a-tag>
          </template>
          <span v-else class="sequence-empty">暂无</span>
        </div>
      </div>

      <div class="modal-footer">
        <a-button type="primary" :disabled="selectedCount === 0" @click="handleSubmit">
          确认派单
        </a-button>
        <a-button style="margin-left: 8px" @click="handleCancel">
          取消
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { defineComponent, ref, reactive, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import { getProducts } from '@/api/product';
import { createOrUpdateUserTask, getUserDetail, getUserTask } from '@/api/user';

export default defineComponent({
  name: 'AssignOrderModal',
  components: {
    SearchOutlined,
    ReloadOutlined
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
  emits: ['update:visible', 'success'],
  setup(props, { emit }) {
    const loading = ref(false);
    const productList = ref([]);
    const selectedCount = ref(0);
    const totalAmount = ref(0);
    const totalCommission = ref(0);
    const startAfterOrder = ref();
    const currentCompletedTasks = ref(null);
    const assignedOrderSequences = ref([]);
    
    const selectedProducts = reactive(new Map());
    
    const completedTasks = computed(() => {
      if (Number.isFinite(currentCompletedTasks.value)) {
        return currentCompletedTasks.value;
      }

      if (props.userData.taskCount) {
        const parts = props.userData.taskCount.split('/');
        if (parts.length === 2) {
          return parseInt(parts[0]) || 0;
        }
      }
      
      return 0;
    });
    
    const searchForm = reactive({
      keyword: '',
      minPrice: null,
      maxPrice: null
    });
    
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total) => `共 ${total} 条`,
      locale: {
        items_per_page: '条/页',
        jump_to: '跳至',
        jump_to_confirm: '确定',
        page: '页',
        prev_page: '上一页',
        next_page: '下一页',
        prev_5: '向前 5 页',
        next_5: '向后 5 页',
        prev_3: '向前 3 页',
        next_3: '向后 3 页'
      }
    });
    
    const columns = [
      { title: '选择', key: 'selection', width: 60, align: 'center' },
      { title: '商品图片', dataIndex: 'product_pic', key: 'product_pic', width: 100, align: 'center' },
      { title: '商品名称', dataIndex: 'product_title', key: 'product_title' },
      { title: '价格', dataIndex: 'price', key: 'price', width: 120, align: 'center' },
      { title: '利润率', dataIndex: 'commission', key: 'commission', width: 120, align: 'center' }
    ];
    
    watch(() => props.visible, (newVal) => {
      if (newVal) {
        selectedProducts.clear();
        selectedCount.value = 0;
        totalAmount.value = 0;
        totalCommission.value = 0;
        startAfterOrder.value = undefined;
        currentCompletedTasks.value = null;
        assignedOrderSequences.value = [];
        
        fetchCurrentCompletedTasks().catch(() => {
          currentCompletedTasks.value = parseCompletedTasks(props.userData);
        });
        fetchAssignedOrderSequences();
        fetchProducts();
      }
    });

    const parseOrderList = (value) => {
      if (!value) return [];

      try {
        let parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
          parsed = parsed.flat();
        }

        return (Array.isArray(parsed) ? parsed : [parsed]).filter(Boolean);
      } catch (error) {
        console.error('解析已卡单序号失败:', error);
        return [];
      }
    };

    const extractOrderSequences = (orders) => {
      return orders
        .map(order => Number(order.start_after))
        .filter(sequence => Number.isInteger(sequence) && sequence >= 0);
    };

    const fetchAssignedOrderSequences = async () => {
      if (!props.userData?.id) {
        assignedOrderSequences.value = [];
        return;
      }

      try {
        const res = await getUserTask(props.userData.id);
        const taskData = res?.data?.data || null;
        if (!taskData) {
          assignedOrderSequences.value = [];
          return;
        }

        assignedOrderSequences.value = [...new Set([
          ...extractOrderSequences(parseOrderList(taskData.continuous_order)),
          ...extractOrderSequences(parseOrderList(taskData.lucky_order))
        ])].sort((a, b) => a - b);
      } catch (error) {
        console.error('获取已卡单序号失败:', error);
        assignedOrderSequences.value = [];
      }
    };

    const parseCompletedTasks = (userData) => {
      const completedTaskValue = Number(userData?.completed_tasks);
      if (Number.isFinite(completedTaskValue)) {
        return completedTaskValue;
      }

      const taskCountText = String(userData?.taskCount || '').trim();
      if (taskCountText) {
        const parts = taskCountText.split('/');
        if (parts.length === 2) {
          return parseInt(parts[0]) || 0;
        }
      }

      return 0;
    };

    const fetchCurrentCompletedTasks = async () => {
      if (!props.userData?.id) {
        currentCompletedTasks.value = 0;
        return 0;
      }

      const res = await getUserDetail(props.userData.id);
      const latestUserData = res?.data?.data || null;
      const latestCompletedTasks = parseCompletedTasks(latestUserData);
      currentCompletedTasks.value = latestCompletedTasks;
      return latestCompletedTasks;
    };

    const normalizeRate = (value) => {
      const parsedValue = Number(value || 0);
      if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        return 0;
      }

      return parsedValue > 0 && parsedValue < 1
        ? Number((parsedValue * 100).toFixed(2))
        : Number(parsedValue.toFixed(2));
    };

    const calculateCommissionAmount = (amount, rate) => {
      const normalizedAmount = Number(amount || 0);
      const normalizedRate = normalizeRate(rate);
      if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0 || normalizedRate <= 0) {
        return 0;
      }

      return Number((normalizedAmount * normalizedRate / 100).toFixed(2));
    };
    
    const fetchProducts = async () => {
      loading.value = true;
      try {
        const params = {
          page: pagination.current,
          pageSize: pagination.pageSize,
          keyword: searchForm.keyword,
          minPrice: searchForm.minPrice,
          maxPrice: searchForm.maxPrice
        };
        
        const res = await getProducts(params);
        if (res?.data?.data?.list) {
          productList.value = res.data.data.list.map(item => {
            const isSelected = selectedProducts.has(item.id);
            const commission = getManualDispatchRate();
            
            return {
              ...item,
              selected: isSelected,
              commission: commission
            };
          });
          pagination.total = res.data.data.pagination.total;
        }
      } catch (error) {
        console.error('获取商品列表失败:', error);
        message.error('获取商品列表失败');
      } finally {
        loading.value = false;
      }
    };
    
    const handleSearch = () => {
      pagination.current = 1;
      fetchProducts();
    };
    
    const resetSearch = () => {
      searchForm.keyword = '';
      searchForm.minPrice = null;
      searchForm.maxPrice = null;
      pagination.current = 1;
      fetchProducts();
    };
    
    const handleTableChange = (pag) => {
      pagination.current = pag.current;
      pagination.pageSize = pag.pageSize;
      fetchProducts();
    };
    
    const handleSelectProduct = (record) => {
      if (record.selected) {
        const commission = getManualDispatchRate();
        selectedProducts.set(record.id, {
          ...record,
          commission: commission
        });
      } else {
        selectedProducts.delete(record.id);
      }
      
      calculateSelected();
    };
    
    const calculateSelected = () => {
      let count = 0;
      let amount = 0;
      let commission = 0;
      
      selectedProducts.forEach(item => {
        count++;
        amount += parseFloat(item.price);
        commission += calculateCommissionAmount(item.price || 0, item.commission || 0);
      });
      
      selectedCount.value = count;
      totalAmount.value = Number(amount.toFixed(2));
      totalCommission.value = Number(commission.toFixed(2));
    };
    
    const getManualDispatchRate = () => {
      const cardRewardRate = normalizeRate(props.userData.vip?.card_reward_rate || 0);
      if (cardRewardRate > 0) {
        return cardRewardRate;
      }

      return normalizeRate(props.userData.vip?.reward_rate || 0);
    };

    const handleCommissionChange = (record, value) => {
      record.commission = value;
      
      if (selectedProducts.has(record.id)) {
        const item = selectedProducts.get(record.id);
        item.commission = value;
        selectedProducts.set(record.id, item);
        
        calculateSelected();
      }
    };
    
    const handleSubmit = async () => {
      const selectedItems = Array.from(selectedProducts.values());

      if (startAfterOrder.value === undefined || startAfterOrder.value === null || startAfterOrder.value === '') {
        return message.error('从第几单开始为必填项');
      }

      if (!Number.isInteger(Number(startAfterOrder.value)) || Number(startAfterOrder.value) < 0) {
        return message.error('从第几单开始必须为大于等于 0 的整数');
      }

      const newOrderSequences = selectedItems.map((item, idx) => Number(startAfterOrder.value) + idx);
      const conflictedSequence = newOrderSequences.find(sequence => assignedOrderSequences.value.includes(sequence));
      if (conflictedSequence !== undefined) {
        return message.warning(`第 ${conflictedSequence} 单已卡单，请更换开始序号`);
      }
      
      try {
        const latestCompletedTasks = await fetchCurrentCompletedTasks();

        if (Number(startAfterOrder.value) < latestCompletedTasks) {
          return message.warning(`当前用户订单量为 ${latestCompletedTasks}，开始订单数不能小于当前订单量`);
        }

        const taskData = {
          user_id: props.userData.id,
          start_after: Number(startAfterOrder.value),
          lucky_order: JSON.stringify([]),
          continuous_order: JSON.stringify(selectedItems.map((item, idx) => ({
            product_id: item.id,
            price: parseFloat(item.price),
            commission: parseFloat(item.commission),
            start_after: Number(startAfterOrder.value) + idx
          })))
        };
        
        await createOrUpdateUserTask(props.userData.id, taskData);
        
        message.success('派单设置成功');
        emit('success');
        emit('update:visible', false);
      } catch (error) {
        console.error('派单设置失败:', error);
        message.error('派单设置失败: ' + (error.response?.data?.message || error.message || '未知错误'));
      }
    };
    
    const handleCancel = () => {
      emit('update:visible', false);
    };
    
      return {
      loading,
      productList,
      searchForm,
      pagination,
      columns,
      selectedCount,
      totalAmount,
      totalCommission,
      startAfterOrder,
      assignedOrderSequences,
      completedTasks,
      normalizeRate,
      getManualDispatchRate,
      handleSearch,
      resetSearch,
      handleTableChange,
      handleSelectProduct,
      handleCommissionChange,
      handleSubmit,
      handleCancel
    };
  }
});
</script>

<style lang="less" scoped>
.assign-order-container {
  .user-info-section {
    margin-bottom: 20px;
    
    .user-info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      
      .info-card {
        background: linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%);
        border: 1px solid #e6f4ff;
        border-radius: 8px;
        padding: 12px 16px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
          border-color: #91caff;
        }
        
        .info-label {
          font-size: 12px;
          color: #8c8c8c;
          margin-bottom: 4px;
          font-weight: 500;
        }
        
        .info-value {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.4;
          
          &.username {
            color: #1890ff;
          }
          
          &.balance {
            color: #52c41a;
            font-size: 15px;
          }
          
          &.task {
            color: #fa541c;
          }
          
          &.vip {
            color: #722ed1;
            font-size: 13px;
          }
        }
      }
    }
  }
  
  .search-section {
    margin-bottom: 16px;
    
    .ant-form {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .search-buttons {
        margin-left: auto;
      }
    }
  }
  
  .table-section {
    margin-bottom: 16px;
    
    .product-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
    }
    
    .price {
      color: #ff4d4f;
      font-weight: bold;
    }
    
    .commission {
      color: #52c41a;
      font-weight: bold;
    }
    
    .commission-container {
      display: flex;
      align-items: center;
      
      :deep(.ant-input-number) {
        .ant-input-number-handler-wrap {
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        &:hover .ant-input-number-handler-wrap {
          opacity: 1;
        }
      }
      
      :deep(.ant-input-number-input) {
        color: #52c41a;
        font-weight: bold;
      }
    }
  }
  
  .selected-info {
    margin-bottom: 16px;
    padding: 8px;
    background-color: #f5f5f5;
    border-radius: 4px;
    
    .selected-count {
      font-size: 14px;
      
      .highlight {
        color: #1890ff;
        font-weight: bold;
      }
      
      .success {
        color: #52c41a;
      }
    }
  }
  
  .order-settings {
    margin-bottom: 16px;
    
    .order-tip {
      margin-left: 8px;
      color: #999;
      font-size: 12px;
    }

    .assigned-order-sequences {
      margin-top: 8px;
      font-size: 13px;
      color: #666;

      .sequence-label {
        margin-right: 4px;
        font-weight: 500;
      }

      .sequence-empty {
        color: #999;
      }
    }
  }
  
  .modal-footer {
    margin-top: 24px;
    text-align: right;
  }
}
</style> 
