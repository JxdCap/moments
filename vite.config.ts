import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 设置打包后的资源基础路径为 /memos/
  // 这样打包出的 index.html 引入 JS/CSS 时会带上这个前缀
  base: '/memos/', 
});