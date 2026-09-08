import level1Img from '@/assets/static/img/profile/level-1.png'
import level2Img from '@/assets/static/img/profile/level-2.png'
import level3Img from '@/assets/static/img/profile/level-3.png'
import level4Img from '@/assets/static/img/profile/level-4.png'
import level5Img from '@/assets/static/img/profile/level-5.png'

const vipLevelIcons = {
  1: level1Img,
  2: level2Img,
  3: level3Img,
  4: level4Img,
  5: level5Img
}

export function getVipDisplayName(userInfo) {
  const vipName = String(userInfo?.vip?.vip_name || userInfo?.vip_name || '').trim()

  if (vipName) {
    return vipName
  }

  const rawLevel = Number(userInfo?.vip_level || userInfo?.vip?.vip_level || 1)
  const normalizedLevel = Number.isFinite(rawLevel) ? Math.max(1, Math.round(rawLevel)) : 1

  return `VIP ${normalizedLevel}`
}

export function getVipLevelIcon(userInfo) {
  const rawLevel = Number(userInfo?.vip_level || userInfo?.vip?.vip_level || 1)
  const normalizedLevel = Number.isFinite(rawLevel) ? Math.max(1, Math.min(Math.round(rawLevel), 5)) : 1

  return vipLevelIcons[normalizedLevel] || level1Img
}
