import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // GitHub Pages 项目站点挂在 /canvas-gacha-demo/ 下；本地 dev 仍用根路径，方便直接打开 localhost:5173。
  base: command === 'serve' ? '/' : '/canvas-gacha-demo/',
  server: { port: 5173 },
}));
