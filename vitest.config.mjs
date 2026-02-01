import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: 'jsdom',
        include: [
            'test',
            '**/__tests__/*.{test,spec}.ts?(x)',
            '**/*.{test,spec}.ts?(x)',
        ],
    },
})