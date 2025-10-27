import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {prefix} from '../lib/prefix'

// https://vitejs.dev/config/
export default defineConfig(({command}) => {
    // When running in dev mode, use the React plugin
    if (command === 'serve') {
        return {
            plugins: [react()],
        }
    // During build, use the classic runtime and build as an IIFE so we can deliver it to the browser
    } else {
        return {
            plugins: [react({jsxRuntime: 'classic'})],
            build: {
                lib: {
                    formats: ['iife'],
                    entry: 'src/footer.tsx',
                    name: 'Footer',
                },
                rollupOptions: {
                    external: ['react', 'react-dom', 'remixicon/fonts/remixicon.css'],
                    output: {
                        globals: {
                            'react': 'React',
                            'react-dom': 'ReactDOM'
                        },
                        assetFileNames: (assetInfo) => {
                            if (assetInfo.name == 'style.css')
                              return 'footer.css';
                            return assetInfo.name;
                          },
                    }
                }
            },
        }
    }

})
