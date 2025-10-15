import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {prefix} from '../lib/prefix'

// https://vitejs.dev/config/
export default defineConfig(({command}) => {
    // When running in dev mode, use the React plugin
    if (command === 'serve') {
        return {
            plugins: [react()],
            css: prefix()
        }
    // During build, use the classic runtime and build as an IIFE so we can deliver it to the browser
    } else {
        return {
            plugins: [react({jsxRuntime: 'classic'})],
            css: prefix(),
            build: {
                outDir: './dist/base-map',
                lib: {
                    formats: ['iife'],
                    entry: 'src/base-map.tsx',
                    name: 'OpenstadHeadlessBaseMap',
                    fileName: 'base-map',
                },
                rollupOptions: {
                    external: [
                        'react',
                        'react-dom',
                        'remixicon/fonts/remixicon.css',
                        '@utrecht/component-library-css',
                        '@utrecht/design-tokens/dist/root.css',
                    ],
                    output: {
                        globals: {
                            'react': 'React',
                            'react-dom': 'ReactDOM'
                        }
                    }
                }
            },
        }
    }

})



  
