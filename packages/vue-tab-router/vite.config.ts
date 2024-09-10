import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import Dts from 'vite-plugin-dts';

export default defineConfig({
    resolve: {
        alias: [
            { find: '@', replacement: resolve(__dirname, "src/") }
        ]
    },
    build: {
        // target: 'esnext',
        sourcemap: false,
        cssCodeSplit: true,
        lib: {
            entry: 'src/index.ts',
            formats: ['umd'],
            name: 'VueTabRouter',
            fileName: 'vue-tab-router'
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: "Vue",
                },
            },
        }
    },
    plugins: [
        Vue(),
        Dts({ rollupTypes: false })
    ],
    define: {
        'process.env': {},
        __SSR__: `true`,
        __DEV__: `false`,
        __COMPAT__: `false`,
        __FEATURE_SUSPENSE__: `true`,
        __FEATURE_PROD_DEVTOOLS__: `false`,
    }
});