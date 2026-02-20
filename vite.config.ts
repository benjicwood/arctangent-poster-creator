import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => {
  return {
    plugins: [vue()],
    base: command === 'build' ? '/poster-creator/' : '/',
  }
})