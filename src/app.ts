import { notification } from 'antd'

export const dva = {
  config: {
    onError(e: ErrorEvent) {
      e.preventDefault()
      notification.error({
        message: '请求失败',
        description: e.message,
      })
    }
  }
}