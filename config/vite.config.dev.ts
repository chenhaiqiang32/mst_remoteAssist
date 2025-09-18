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
          target: 'https://ucenter-test.teamhelper.cn', // 后台服务器地址
          // target: 'https://assist-test.teamhelper.cn', // 后台服务器地址
          // target: 'https://assist.teamhelper.cn', // 后台服务器地址
          changeOrigin: true, // 是否允许不同源
          secure: true, // 支持https
          rewrite: (path: any) => path.replace(/^\/api/, '/api'),
        },
        // '/meeting': {
        //   target: 'https://api-v3-test.teamhelper.cn', // 后台服务器地址
        //   changeOrigin: true, // 是否允许不同源
        //   secure: true, // 支持https
        //   rewrite: (path: any) => path.replace(/^\/api/, '/meeting'),
        // },
        // '/chat': {
        //   target: 'https://api-v3-test.teamhelper.cn', // 后台服务器地址
        //   changeOrigin: true, // 是否允许不同源
        //   secure: true, // 支持https
        //   rewrite: (path: any) => path.replace(/^\/api/, '/chat'),
        // },
      },
    },
  },
  baseConfig
);
