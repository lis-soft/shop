import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import removeConsole from 'vite-plugin-remove-console'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isProd = mode === 'production'
  
  return {
    plugins: [
      vue(),
      isProd && removeConsole()
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
      devSourcemap: !isProd,
    },
    server: {
      port: env.VITE_PORT,
      proxy: {
        '/admin': {
          target: 'http://127.0.0.1:10303',
          changeOrigin: true
        },
        '/uploads': {
          target: 'http://127.0.0.1:10303',
          changeOrigin: true
        }
      },
      hmr: {
        overlay: false,
        clientPort: env.VITE_PORT
      },
      watch: {
        usePolling: true
      }
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log']
        }
      },
      cssCodeSplit: false,
      cssTarget: 'chrome80',
      rollupOptions: {
        output: {
          // 将依赖包打包到单独的 chunk 中
          manualChunks: {
            // 将 Vue 相关库打包到一起
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // 将 UI 库打包到一起
            'ui-vendor': ['ant-design-vue'],
            // 将图表库打包到一起
            'chart-vendor': ['echarts'],
          },
          // 用于从入口点创建的块的打包输出格式
          entryFileNames: 'assets/js/[name].[hash].js',
          // 用于命名代码拆分时创建的共享块的输出命名
          chunkFileNames: 'assets/js/[name].[hash].js',
          // 用于输出静态资源的命名
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            let extType = info[info.length - 1]
            
            if (/\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/.test(assetInfo.name)) {
              return `assets/img/[name].[hash].[ext]`
            } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
              return `assets/fonts/[name].[hash].[ext]`
            } else if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/.test(assetInfo.name)) {
              return `assets/media/[name].[hash].[ext]`
            } else if (extType === 'css') {
              return `assets/css/app.[hash].css`
            }
            
            return `assets/[ext]/[name].[hash].[ext]`
          },
        }
      },
      // 设置 chunk 大小警告的限制
      chunkSizeWarningLimit: 1000,
      // 启用源码映射
      sourcemap: !isProd,
    }
  }
}) 
