// hooks/useNotification.ts
import { ref, onMounted } from 'vue';

export default function useNotification() {
  const permission: any = ref<NotificationPermission>('default');

  // 初始化时检查权限
  onMounted(() => {
    if ('Notification' in window) {
      permission.value = Notification.permission;
    }
  });

  // 请求通知权限
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return;
    }

    try {
      const status: any = await Notification.requestPermission();
      permission.value = status;
      console.log('请求通知权限', permission.value);
      // return status;
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  // 发送系统通知
  const notify = (options: NotificationOptions & { title: string }) => {
    if (permission.value !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }
    console.log('发送系统通知', options.title, options);
    const notification: any = new Notification(options.title, options);
    // 监听点击事件
    notification.onclick = () => {
      window.focus();
      console.log('Notification clicked');
    };
    console.log('发送系统通知-notification', notification);
    // return notification;
  };

  return { permission, requestPermission, notify };
}
