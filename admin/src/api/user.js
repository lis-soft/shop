import request from '@/utils/request'

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

// 获取用户详情
export function getUserDetail(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'get'
  })
}

// 新增用户
export function addUser(data) {
    return request({
      url: '/admin/users',
      method: 'post',
      data
    })
  }

// 更新用户
export function updateUser(id, data) {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}

// 调整用户余额
export function adjustUserBalance(data) {
  return request({
    url: '/admin/users/balance',
    method: 'post',
    data
  })
}

// 获取用户余额记录
export function getUserBalanceRecords(userId, params) {
  return request({
    url: `/admin/users/${userId}/balance-records`,
    method: 'get',
    params
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/admin/user/info',
    method: 'put',
    data
  })
}

// 获取用户团队成员和统计
export function getUserTeam(userId, params) {
  return request({
    url: `/admin/users/${userId}/team`,
    method: 'get',
    params
  })
}

// 更新用户备注
export function updateUserRemark(id, data) {
  return request({
    url: `/admin/users/${id}/remark`,
    method: 'put',
    data
  })
}

// 重置用户任务
export function resetUserTasks(userId) {
  return request({
    url: `/admin/users/${userId}/reset-tasks`,
    method: 'post'
  })
}

// 获取用户任务设置
export function getUserTask(userId) {
  return request({
    url: `/admin/users/${userId}/task`,
    method: 'get'
  })
}

// 保存用户任务设置
export function saveUserTask(userId, data) {
  return request({
    url: `/admin/users/${userId}/task`,
    method: 'post',
    data
  })
}

// 创建或更新用户任务
export function createOrUpdateUserTask(userId, data) {
  return request({
    url: `/admin/users/${userId}/task`,
    method: 'put',
    data
  })
}

// 删除用户任务
export function deleteUserTask(userId) {
  return request({
    url: `/admin/users/${userId}/task`,
    method: 'delete'
  })
}

// 更新用户任务状态
export function updateUserTaskStatus(userId, status) {
  return request({
    url: `/admin/users/${userId}/task/status`,
    method: 'put',
    data: { status }
  })
}

// 切换用户状态
export function toggleUserStatus(userId, status) {
  return request({
    url: `/admin/users/${userId}/status`,
    method: 'put',
    data: { status }
  })
}

// 切换用户抢单权限
export function toggleUserTaskStatus(userId, status) {
  return request({
    url: `/admin/users/${userId}/task-status`,
    method: 'put',
    data: { status }
  })
}


// 删除幸运订单
export function updateUserLuckyOrder(userId, lucky_order) {
  return request({
    url: `/admin/user-task/${userId}/lucky-order`,
    method: 'patch',
    data: { lucky_order }
  })
}

// 删除连续订单
export function updateUserContinuousOrder(userId, continuous_order) {
  return request({
    url: `/admin/user-task/${userId}/continuous-order`,
    method: 'patch',
    data: { continuous_order }
  })
}

// 获取管理员列表
export function getAdminList() {
  return request({
    url: '/admin/users/admins',
    method: 'get'
  })
}

// 更新用户银行卡信息
export function updateUserBankCard(userId, data) {
  return request({
    url: `/admin/users/${userId}/bank-card`,
    method: 'put',
    data
  })
}

