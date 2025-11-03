import { mergeConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import baseConfig from './vite.config.base';

export default mergeConfig(
  {
    mode: 'development',
    server: {
      open: true,
      port: 7007,
      fs: {
        strict: true,
      },
      proxy: {
        '/api': {
          target: 'https://192.168.1.88:9012', // 后台服务器地址
          changeOrigin: true, // 是否允许不同源
          secure: false, // 支持https
          rewrite: (path: any) => path.replace(/^\/api/, '/api'),
        },
      },
    },
  },
  baseConfig
);
