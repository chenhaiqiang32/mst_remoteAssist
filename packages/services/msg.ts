import { createApp, h } from 'vue';
import Message from '../components/message/index.vue';

interface MessageOptions {
  content: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

const createMessage = ({
  content,
  type = 'info',
  duration = 3000,
}: MessageOptions) => {
  const mountNode = document.createElement('div');
  document.body.appendChild(mountNode);

  const app = createApp({
    render() {
      return h(Message, { content, type, duration });
    },
  });

  app.mount(mountNode);

  setTimeout(() => {
    app.unmount();
    document.body.removeChild(mountNode);
  }, duration + 500); // Keep the element a bit longer to allow for transition
};

export default {
  info(content: string, duration?: number) {
    createMessage({ content, type: 'info', duration });
  },
  success(content: string, duration?: number) {
    createMessage({ content, type: 'success', duration });
  },
  warning(content: string, duration?: number) {
    createMessage({ content, type: 'warning', duration });
  },
  error(content: string, duration?: number) {
    createMessage({ content, type: 'error', duration });
  },
};
