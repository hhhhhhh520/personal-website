import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['rag/__tests__/**/*.test.ts', 'rag/scripts/**/*.test.py'],
    exclude: ['node_modules', 'rag/venv'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['rag/**/*.ts', 'app/api/rag/**/*.ts'],
      exclude: ['rag/__tests__', 'rag/scripts']
    },
    testTimeout: 30000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})