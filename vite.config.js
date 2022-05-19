import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: `/nano-proof`,
  plugins: [
    Components({ /* options */ }),
    vue()
    ]
})
